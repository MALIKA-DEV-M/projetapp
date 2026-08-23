"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function PublicSiteContent() {
  const { siteId } = useParams();
  const [pages, setPages] = useState<any[]>([]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSite() {
      if (!siteId) return;
      const { data, error } = await supabase
        .from("sites")
        .select("content")
        .eq("id", siteId)
        .single();

      if (!error && data?.content?.pages) {
        setPages(data.content.pages);
      }
      setLoading(false);
    }
    loadSite();
  }, [siteId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="animate-pulse">Chargement du site...</p>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>Site introuvable ou vide.</p>
      </div>
    );
  }

  const activePage = pages[activePageIndex] || pages[0];

  const handleElementClick = (el: any) => {
    if (el.shapeType === "button" && el.content?.link) {
      const link = el.content.link;
      if (link.startsWith("/")) {
        const pageIdx = pages.findIndex(
          (p) =>
            p.id === link.replace("/", "") ||
            p.title.toLowerCase() === link.replace("/", "").toLowerCase()
        );
        if (pageIdx !== -1) setActivePageIndex(pageIdx);
      } else {
        window.open(link, el.content.linkTarget || "_self");
      }
    }
  };

  return (
    <div
      className="min-h-screen w-full relative overflow-x-hidden flex flex-col items-center justify-start"
      style={{ backgroundColor: activePage.backgroundColor || "#ffffff" }}
    >
      {pages.length > 1 && (
        <nav className="w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 py-3 px-6 flex justify-center gap-4 fixed top-0 z-50">
          {pages.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setActivePageIndex(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activePageIndex === idx
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {p.title}
            </button>
          ))}
        </nav>
      )}

      <div
        className={`relative w-[850px] h-[750px] ${
          pages.length > 1 ? "mt-16" : ""
        }`}
      >
        {activePage.elements.map((el: any) => (
          <div
            key={el.id}
            onClick={() => handleElementClick(el)}
            style={{
              position: "absolute",
              left: `${el.x}px`,
              top: `${el.y}px`,
              width: `${el.width}px`,
              height: `${el.height}px`,
              zIndex: el.zIndex || 1,
              cursor:
                el.shapeType === "button" && el.content?.link
                  ? "pointer"
                  : "default",
            }}
          >
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
                className="w-full h-full flex items-center justify-center px-2"
              >
                {el.content.text}
              </div>
            )}

            {el.type === "image" && el.content.imageUrl && (
              <img
                src={el.content.imageUrl}
                alt=""
                style={{ borderRadius: `${el.content.borderRadius}px` }}
                className="w-full h-full object-cover"
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
                className="w-full h-full flex items-center justify-center font-semibold border p-2 overflow-hidden shadow-sm hover:opacity-95 transition"
              >
                {el.content.text}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PublicSite() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <PublicSiteContent />
    </Suspense>
  );
}