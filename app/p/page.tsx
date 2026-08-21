"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Type,
  Image as ImageIcon,
  Shapes,
  Trash2,
  Save,
  Crown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Sliders,
  Move,
  Square,
  Circle,
  MousePointerClick,
  Maximize2,
  Link as LinkIcon,
  Plus,
  FileText,
  Paintbrush,
  Copy,
  Layers,
  ArrowUp,
  ArrowDown,
  Monitor,
  Tablet,
  Smartphone,
  ArrowLeft,
} from "lucide-react";

type ShapeType = "rectangle" | "circle" | "pill" | "button";
type ElementType = "heading" | "paragraph" | "image" | "shape";

type CanvasElement = {
  id: string;
  type: ElementType;
  shapeType?: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  content: {
    text?: string;
    imageUrl?: string;
    alignment?: "left" | "center" | "right";
    bgColor?: string;
    borderColor?: string;
    borderWidth?: number;
    textColor?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: "normal" | "bold";
    fontStyle?: "normal" | "italic";
    borderRadius?: number;
    link?: string;
    linkTarget?: "_self" | "_blank";
  };
};

type Page = {
  id: string;
  title: string;
  backgroundColor: string;
  elements: CanvasElement[];
};

export default function Editor() {
  const [pages, setPages] = useState<Page[]>([
    {
      id: "page-1",
      title: "Accueil",
      backgroundColor: "#ffffff",
      elements: [],
    },
  ]);

  const [siteId, setSiteId] = useState<string | null>(null);
  const [siteName, setSiteName] = useState<string>("Mon Projet Studio Pro");
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deviceMode, setDeviceMode] = useState<"desktop" | "tablet" | "mobile">("desktop");

  // Interaction états
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Chargement du site
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("plan")
          .eq("id", user.id)
          .maybeSingle();
        if (profile?.plan) setUserPlan(profile.plan);
      }

      const queryId = searchParams.get("id");
      if (queryId) {
        setSiteId(queryId);
        const { data, error } = await supabase
          .from("sites")
          .select("*")
          .eq("id", queryId)
          .single();

        if (!error && data?.content?.pages) {
          setPages(data.content.pages);
          if (data.name) setSiteName(data.name);
        }
      }
    }
    init();
  }, [searchParams]);

  const activePage = pages[activePageIndex] || pages[0];
  const selectedElement = activePage?.elements.find((el) => el.id === selectedElementId);

  // Largeur dynamique selon le mode Responsive
  const getCanvasWidth = () => {
    if (deviceMode === "mobile") return "375px";
    if (deviceMode === "tablet") return "600px";
    return "850px";
  };

  // Mettre à jour l'élément sélectionné
  const updateSelectedElement = (
    newContent: Partial<CanvasElement["content"]>,
    dimensions?: { width?: number; height?: number }
  ) => {
    if (!selectedElementId) return;

    setPages((prevPages) => {
      const updated = [...prevPages];
      updated[activePageIndex].elements = updated[activePageIndex].elements.map((el) => {
        if (el.id === selectedElementId) {
          return {
            ...el,
            width: dimensions?.width ?? el.width,
            height: dimensions?.height ?? el.height,
            content: { ...el.content, ...newContent },
          };
        }
        return el;
      });
      return updated;
    });
  };

  // DUPLICATION & SUPPRESSION
  const duplicateElement = useCallback(() => {
    if (!selectedElement) return;

    const duplicated: CanvasElement = {
      ...selectedElement,
      id: `el-${Date.now()}`,
      x: selectedElement.x + 20,
      y: selectedElement.y + 20,
      zIndex: selectedElement.zIndex + 1,
      content: { ...selectedElement.content },
    };

    setPages((prevPages) => {
      const updated = [...prevPages];
      updated[activePageIndex].elements.push(duplicated);
      return updated;
    });
    setSelectedElementId(duplicated.id);
  }, [selectedElement, activePageIndex]);

  const removeElement = useCallback((id: string) => {
    setPages((prevPages) => {
      const updated = [...prevPages];
      updated[activePageIndex].elements = updated[activePageIndex].elements.filter((el) => el.id !== id);
      return updated;
    });
    setSelectedElementId(null);
  }, [activePageIndex]);

  // GESTION DES Z-INDEX (CALQUES)
  const changeZIndex = (delta: number) => {
    if (!selectedElementId) return;
    setPages((prevPages) => {
      const updated = [...prevPages];
      updated[activePageIndex].elements = updated[activePageIndex].elements.map((el) => {
        if (el.id === selectedElementId) {
          return { ...el, zIndex: Math.max(1, el.zIndex + delta) };
        }
        return el;
      });
      return updated;
    });
  };

  // RACCOURCIS CLAVIER (Suppr & Ctrl+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return; // Éviter de déclencher les raccourcis pendant l'écriture dans un champ
      }

      if ((e.key === "Delete" || e.key === "Backspace") && selectedElementId) {
        removeElement(selectedElementId);
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d" && selectedElementId) {
        e.preventDefault();
        duplicateElement();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedElementId, duplicateElement, removeElement]);

  // AJOUT ÉLÉMENT
  const addElement = (type: ElementType, shapeType?: ShapeType) => {
    const maxZ = Math.max(0, ...activePage.elements.map((e) => e.zIndex || 1));
    const newEl: CanvasElement = {
      id: `el-${Date.now()}`,
      type,
      shapeType,
      x: 50 + Math.random() * 30,
      y: 50 + Math.random() * 30,
      width: type === "heading" || type === "paragraph" ? 400 : shapeType === "circle" ? 120 : 180,
      height: type === "heading" ? 60 : type === "paragraph" ? 80 : shapeType === "circle" ? 120 : 50,
      zIndex: maxZ + 1,
      content: {
        text:
          type === "heading"
            ? "Nouveau Titre"
            : type === "paragraph"
            ? "Insérez votre texte ici..."
            : shapeType === "button"
            ? "Bouton Action"
            : shapeType
            ? "Forme Texte"
            : "",
        imageUrl:
          type === "image"
            ? "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80"
            : "",
        fontSize: type === "heading" ? 32 : 16,
        fontWeight: type === "heading" ? "bold" : "normal",
        fontStyle: "normal",
        fontFamily: "Inter, sans-serif",
        alignment: "center",
        textColor: shapeType === "button" ? "#ffffff" : "#0f172a",
        bgColor: shapeType === "button" ? "#4f46e5" : shapeType ? "#e2e8f0" : "transparent",
        borderColor: "#cbd5e1",
        borderWidth: 0,
        borderRadius: shapeType === "circle" ? 9999 : shapeType === "pill" ? 50 : shapeType === "button" ? 10 : 8,
        link: "",
        linkTarget: "_self",
      },
    };

    const updatedPages = [...pages];
    updatedPages[activePageIndex].elements.push(newEl);
    setPages(updatedPages);
    setSelectedElementId(newEl.id);
    setShowShapeMenu(false);
  };

  // DEPLACEMENT (DRAG)
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedElementId(id);
    setIsDragging(true);

    const el = activePage.elements.find((item) => item.id === id);
    if (el) {
      setDragOffset({
        x: e.clientX - el.x,
        y: e.clientY - el.y,
      });
    }
  };

  // REDIMENSIONNEMENT
  const handleResizeMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedElementId(id);
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!selectedElementId || !canvasRef.current) return;

      const canvasRect = canvasRef.current.getBoundingClientRect();

      if (isDragging) {
        const newX = Math.max(0, Math.min(e.clientX - canvasRect.left - dragOffset.x, canvasRect.width - 20));
        const newY = Math.max(0, Math.min(e.clientY - canvasRect.top - dragOffset.y, canvasRect.height - 20));

        setPages((prevPages) => {
          const updated = [...prevPages];
          updated[activePageIndex].elements = updated[activePageIndex].elements.map((el) =>
            el.id === selectedElementId ? { ...el, x: newX, y: newY } : el
          );
          return updated;
        });
      } else if (isResizing) {
        const el = activePage.elements.find((item) => item.id === selectedElementId);
        if (!el) return;

        const newWidth = Math.max(30, e.clientX - canvasRect.left - el.x);
        const newHeight = Math.max(20, e.clientY - canvasRect.top - el.y);

        setPages((prevPages) => {
          const updated = [...prevPages];
          updated[activePageIndex].elements = updated[activePageIndex].elements.map((item) =>
            item.id === selectedElementId ? { ...item, width: newWidth, height: newHeight } : item
          );
          return updated;
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, selectedElementId, dragOffset, activePageIndex, activePage]);

  // Upload Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedElementId) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const cleanFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    const { error } = await supabase.storage.from("media").upload(cleanFileName, file);
    setUploading(false);

    if (error) {
      alert("Erreur upload : " + error.message);
    } else {
      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${cleanFileName}`;
      updateSelectedElement({ imageUrl: publicUrl });
    }
  };

  // ENREGISTREMENT DYNAMIQUE (Mise à jour ou Création)
  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Connectez-vous pour enregistrer !");
      setSaving(false);
      return;
    }

    if (siteId) {
      const { error } = await supabase
        .from("sites")
        .update({ name: siteName, content: { pages } })
        .eq("id", siteId);

      setSaving(false);
      if (error) alert("Erreur : " + error.message);
      else alert("✅ Projet sauvegardé avec succès !");
    } else {
      const { data, error } = await supabase
        .from("sites")
        .insert([{ name: siteName, content: { pages }, user_id: user.id }])
        .select()
        .single();

      setSaving(false);
      if (error) alert("Erreur : " + error.message);
      else if (data) {
        setSiteId(data.id);
        alert("✅ Nouveau projet créé et enregistré !");
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      
      {/* 1. HEADER */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
            title="Retour au Tableau de bord"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="bg-transparent font-bold text-sm text-white focus:outline-none border-b border-transparent focus:border-indigo-500 px-1 py-0.5"
          />

          <div className="h-5 w-[1px] bg-slate-800" />

          {/* Menus d'insertion */}
          <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800 relative">
            <button
              onClick={() => addElement("heading")}
              className="px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-slate-800 text-slate-300 flex items-center gap-1.5 transition"
            >
              <Type className="w-3.5 h-3.5 text-indigo-400" /> + Titre
            </button>
            <button
              onClick={() => addElement("paragraph")}
              className="px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-slate-800 text-slate-300 flex items-center gap-1.5 transition"
            >
              <Type className="w-3.5 h-3.5 text-indigo-400" /> + Texte
            </button>
            <button
              onClick={() => addElement("image")}
              className="px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-slate-800 text-slate-300 flex items-center gap-1.5 transition"
            >
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" /> + Image
            </button>

            {/* Menu Formes */}
            <div className="relative">
              <button
                onClick={() => setShowShapeMenu(!showShapeMenu)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-slate-800 text-slate-300 flex items-center gap-1.5 transition bg-slate-900 border border-slate-700"
              >
                <Shapes className="w-3.5 h-3.5 text-amber-400" /> + Formes
              </button>

              {showShapeMenu && (
                <div className="absolute top-10 left-0 bg-slate-900 border border-slate-800 rounded-xl p-2 shadow-2xl flex flex-col gap-1 w-44 z-50">
                  <button
                    onClick={() => addElement("shape", "rectangle")}
                    className="flex items-center gap-2 text-xs text-slate-300 hover:bg-slate-800 p-2 rounded-lg text-left"
                  >
                    <Square className="w-3.5 h-3.5 text-amber-400" /> Rectangle
                  </button>
                  <button
                    onClick={() => addElement("shape", "circle")}
                    className="flex items-center gap-2 text-xs text-slate-300 hover:bg-slate-800 p-2 rounded-lg text-left"
                  >
                    <Circle className="w-3.5 h-3.5 text-indigo-400" /> Cercle
                  </button>
                  <button
                    onClick={() => addElement("shape", "pill")}
                    className="flex items-center gap-2 text-xs text-slate-300 hover:bg-slate-800 p-2 rounded-lg text-left"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-emerald-400" /> Pilule / Badge
                  </button>
                  <button
                    onClick={() => addElement("shape", "button")}
                    className="flex items-center gap-2 text-xs text-slate-300 hover:bg-slate-800 p-2 rounded-lg text-left"
                  >
                    <MousePointerClick className="w-3.5 h-3.5 text-indigo-400" /> Bouton Redirection
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sélecteur de Responsive (Desktop / Tablette / Mobile) */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setDeviceMode("desktop")}
            className={`p-1.5 rounded-lg transition ${
              deviceMode === "desktop" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
            title="Ordinateur (850px)"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeviceMode("tablet")}
            className={`p-1.5 rounded-lg transition ${
              deviceMode === "tablet" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
            title="Tablette (600px)"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeviceMode("mobile")}
            className={`p-1.5 rounded-lg transition ${
              deviceMode === "mobile" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
            title="Mobile (375px)"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Actions Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/pricing")}
            className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-semibold flex items-center gap-1.5"
          >
            <Crown className="w-3.5 h-3.5" /> {userPlan.toUpperCase()}
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Sauvegarde..." : "Enregistrer"}
          </button>
        </div>
      </header>

      {/* BODY ÉDITEUR */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* 2. CANEVAS */}
        <main
          className="flex-1 bg-slate-950 p-6 overflow-auto flex flex-col items-center relative"
          onClick={() => setSelectedElementId(null)}
        >
          {/* BARRE MULTI-PAGES */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: getCanvasWidth() }}
            className="mb-4 flex items-center justify-between bg-slate-900/80 p-2 rounded-xl border border-slate-800 backdrop-blur-md transition-all duration-300"
          >
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              {pages.map((page, idx) => (
                <div
                  key={page.id}
                  onClick={() => {
                    setActivePageIndex(idx);
                    setSelectedElementId(null);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition ${
                    activePageIndex === idx
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-950 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <input
                    type="text"
                    value={page.title}
                    onChange={(e) => {
                      const updated = [...pages];
                      updated[idx].title = e.target.value;
                      setPages(updated);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-transparent text-xs font-medium focus:outline-none w-16 text-center text-inherit"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                const newPage = {
                  id: `page-${Date.now()}`,
                  title: `Page ${pages.length + 1}`,
                  backgroundColor: "#ffffff",
                  elements: [],
                };
                setPages([...pages, newPage]);
                setActivePageIndex(pages.length);
              }}
              className="px-2.5 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-indigo-500/20"
            >
              <Plus className="w-3 h-3" /> Page
            </button>
          </div>

          {/* ZONE DU CANEVAS */}
          <div
            ref={canvasRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: activePage?.backgroundColor || "#ffffff",
              width: getCanvasWidth(),
            }}
            className="h-[750px] rounded-2xl shadow-2xl relative border border-slate-800 overflow-hidden transition-all duration-300"
          >
            {activePage?.elements.map((el) => {
              const isSelected = el.id === selectedElementId;

              return (
                <div
                  key={el.id}
                  onMouseDown={(e) => handleMouseDown(e, el.id)}
                  style={{
                    position: "absolute",
                    left: `${el.x}px`,
                    top: `${el.y}px`,
                    width: `${el.width}px`,
                    height: `${el.height}px`,
                    zIndex: el.zIndex || 1,
                  }}
                  className={`group cursor-move transition-shadow ${
                    isSelected ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-white z-50" : "hover:ring-1 hover:ring-indigo-300"
                  }`}
                >
                  {/* Etiquette type */}
                  {isSelected && (
                    <div className="absolute -top-6 left-0 bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-t-md uppercase flex items-center gap-1 z-50">
                      <Move className="w-2.5 h-2.5" /> {el.shapeType || el.type}
                    </div>
                  )}

                  {/* Boutons rapide Suppr & Dupliquer */}
                  {isSelected && (
                    <div className="absolute -top-6 right-0 flex gap-1 z-50">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateElement();
                        }}
                        className="bg-slate-800 text-white p-1 rounded-t-md hover:bg-slate-700 transition"
                        title="Dupliquer (Ctrl+D)"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeElement(el.id);
                        }}
                        className="bg-red-500 text-white p-1 rounded-t-md hover:bg-red-600 transition"
                        title="Supprimer (Suppr)"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* CONTENU */}
                  <div className="w-full h-full flex items-center justify-center overflow-hidden">
                    {(el.type === "heading" || el.type === "paragraph") && (
                      <div
                        style={{
                          fontSize: `${el.content.fontSize}px`,
                          fontWeight: el.content.fontWeight || "normal",
                          fontStyle: el.content.fontStyle || "normal",
                          fontFamily: el.content.fontFamily || "Inter, sans-serif",
                          color: el.content.textColor,
                          textAlign: el.content.alignment || "left",
                        }}
                        className="w-full h-full flex items-center justify-center px-2 outline-none"
                      >
                        {el.content.text}
                      </div>
                    )}

                    {el.type === "image" && el.content.imageUrl && (
                      <img
                        src={el.content.imageUrl}
                        alt=""
                        style={{ borderRadius: `${el.content.borderRadius}px` }}
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    )}

                    {el.type === "shape" && (
                      <div
                        style={{
                          backgroundColor: el.content.bgColor,
                          borderRadius: `${el.content.borderRadius}px`,
                          borderWidth: `${el.content.borderWidth}px`,
                          borderColor: el.content.borderColor,
                          color: el.content.textColor,
                          fontSize: `${el.content.fontSize}px`,
                          fontWeight: el.content.fontWeight || "normal",
                          fontStyle: el.content.fontStyle || "normal",
                          fontFamily: el.content.fontFamily || "Inter, sans-serif",
                          textAlign: el.content.alignment || "center",
                        }}
                        className="w-full h-full flex items-center justify-center font-semibold shadow-sm border p-2 text-center overflow-hidden"
                      >
                        {el.content.text}
                      </div>
                    )}
                  </div>

                  {/* Poignée Redimensionnement */}
                  {isSelected && (
                    <div
                      onMouseDown={(e) => handleResizeMouseDown(e, el.id)}
                      className="absolute -bottom-2 -right-2 w-4 h-4 bg-indigo-600 border-2 border-white rounded-full cursor-se-resize shadow-lg z-50 hover:scale-125 transition-transform"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </main>

        {/* 3. INSPECTEUR */}
        <aside className="w-80 border-l border-slate-800 bg-slate-900 p-5 flex flex-col gap-6 overflow-y-auto z-20">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">Inspecteur</h2>
          </div>

          {selectedElement ? (
            <div className="flex flex-col gap-5 text-xs">
              
              {/* ÉDITION TEXTE */}
              {selectedElement.type !== "image" && (
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-semibold text-slate-400">Texte contenu</label>
                  <textarea
                    rows={2}
                    className="p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
                    value={selectedElement.content.text || ""}
                    onChange={(e) => updateSelectedElement({ text: e.target.value })}
                  />
                </div>
              )}

              {/* CALQUES (Z-INDEX) */}
              <div className="flex flex-col gap-2 border-b border-slate-800 pb-4">
                <label className="text-[10px] uppercase font-semibold text-slate-400">Ordre d'affichage (Calques)</label>
                <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-mono">Niveau : {selectedElement.zIndex || 1}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => changeZIndex(-1)}
                      className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700"
                      title="Reculer (Aperçu derrière)"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => changeZIndex(1)}
                      className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700"
                      title="Avancer (Aperçu devant)"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* REDIRECTION BOUTON */}
              {selectedElement.shapeType === "button" && (
                <div className="flex flex-col gap-3 border-b border-slate-800 pb-4 bg-indigo-950/20 p-3 rounded-xl border border-indigo-900/40">
                  <div className="flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
                    <label className="text-[10px] uppercase font-bold text-indigo-300">Lien du Bouton</label>
                  </div>
                  <input
                    type="text"
                    placeholder="https://... ou /Page 2"
                    className="p-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:border-indigo-500 outline-none"
                    value={selectedElement.content.link || ""}
                    onChange={(e) => updateSelectedElement({ link: e.target.value })}
                  />
                </div>
              )}

              {/* IMAGE UPLOAD */}
              {selectedElement.type === "image" && (
                <div className="flex flex-col gap-3 border-b border-slate-800 pb-4">
                  <label className="text-[10px] uppercase font-semibold text-slate-400">Remplacer l'image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-600/20 file:text-indigo-300 hover:file:bg-indigo-600/30"
                  />
                </div>
              )}

              {/* TYPOGRAPHIE */}
              {selectedElement.type !== "image" && (
                <div className="flex flex-col gap-3 border-b border-slate-800 pb-4">
                  <label className="text-[10px] uppercase font-semibold text-slate-400">Typographie</label>
                  <select
                    className="p-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                    value={selectedElement.content.fontFamily || "Inter, sans-serif"}
                    onChange={(e) => updateSelectedElement({ fontFamily: e.target.value })}
                  >
                    <option value="Inter, sans-serif">Sans-serif Standard</option>
                    <option value="Georgia, serif">Serif Classique</option>
                    <option value="'Courier New', monospace">Monospace</option>
                  </select>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        updateSelectedElement({
                          fontWeight: selectedElement.content.fontWeight === "bold" ? "normal" : "bold",
                        })
                      }
                      className={`p-2 rounded-lg border flex-1 flex items-center justify-center gap-1 ${
                        selectedElement.content.fontWeight === "bold" ? "bg-indigo-600 text-white" : "bg-slate-950 text-slate-400"
                      }`}
                    >
                      <Bold className="w-4 h-4" /> Gras
                    </button>
                    <button
                      onClick={() =>
                        updateSelectedElement({
                          fontStyle: selectedElement.content.fontStyle === "italic" ? "normal" : "italic",
                        })
                      }
                      className={`p-2 rounded-lg border flex-1 flex items-center justify-center gap-1 ${
                        selectedElement.content.fontStyle === "italic" ? "bg-indigo-600 text-white" : "bg-slate-950 text-slate-400"
                      }`}
                    >
                      <Italic className="w-4 h-4" /> Italique
                    </button>
                  </div>
                </div>
              )}

              {/* COULEURS */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Couleur Texte</label>
                  <input
                    type="color"
                    className="w-full h-8 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                    value={selectedElement.content.textColor || "#0f172a"}
                    onChange={(e) => updateSelectedElement({ textColor: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Couleur Fond</label>
                  <input
                    type="color"
                    className="w-full h-8 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                    value={selectedElement.content.bgColor || "#ffffff"}
                    onChange={(e) => updateSelectedElement({ bgColor: e.target.value })}
                  />
                </div>
              </div>

            </div>
          ) : (
            /* CONFIG GLOBALE DE LA PAGE */
            <div className="flex flex-col gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Paintbrush className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-slate-200">Fond de page</span>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="color"
                    className="w-10 h-10 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                    value={activePage?.backgroundColor || "#ffffff"}
                    onChange={(e) => {
                      const updated = [...pages];
                      updated[activePageIndex].backgroundColor = e.target.value;
                      setPages(updated);
                    }}
                  />
                  <span className="font-mono text-slate-300 uppercase font-semibold">
                    {activePage?.backgroundColor || "#ffffff"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}