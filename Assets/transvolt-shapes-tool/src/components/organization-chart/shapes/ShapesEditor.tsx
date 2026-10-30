"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SHAPE_CATEGORIES, SHAPE_REGISTRY, getShapeDefinition } from "./registry";
import { ShapeDefs, ShapeGeometry } from "./geometry";
import type { ChartShape, EditorTool, ShapeConnector, ShapeKind, ShapesDocument } from "./types";

type Props = {
  initialDocument?: ShapesDocument;
  /** Connect this to the chart's existing debounced autosave/persistence layer. */
  onDocumentChange?: (document: ShapesDocument) => void;
  /** Integrate with existing app PDF export if available. Defaults to browser print. */
  onExportPdf?: (document: ShapesDocument, svg: string) => void;
  className?: string;
};

const uid = () => typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `shape-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const freshDoc = (): ShapesDocument => ({ version: 1, shapes: [], connectors: [] });
const makeShape = (kind: ShapeKind, x: number, y: number): ChartShape => {
  const def = getShapeDefinition(kind);
  return { id: uid(), kind, x, y, width: def.defaultWidth ?? 140, height: def.defaultHeight ?? 80, rotation: 0,
    text: kind === "text" ? "Text label" : "", fill: kind === "text" || def.isLine ? "transparent" : "#DBEAFE",
    fillOpacity: 1, stroke: "#4472C4", strokeWidth: 2, strokeStyle: "solid", fontSize: 14, fontWeight: 500,
    textColor: "#111827", textAlign: "middle", locked: false, zIndex: Date.now() };
};
const clone = <T,>(v:T):T => JSON.parse(JSON.stringify(v));
const clamp = (v:number,min:number,max:number) => Math.max(min,Math.min(max,v));

export default function ShapesEditor({ initialDocument, onDocumentChange, onExportPdf, className }: Props) {
  const [doc, setDoc] = useState<ShapesDocument>(() => initialDocument ? clone(initialDocument) : freshDoc());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<EditorTool>("select");
  const [drawKind, setDrawKind] = useState<ShapeKind | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({x:0,y:0});
  const [draft, setDraft] = useState<{x:number;y:number;w:number;h:number}|null>(null);
  const [connectorStart, setConnectorStart] = useState<string | null>(null);
  const [history, setHistory] = useState<ShapesDocument[]>([]);
  const [future, setFuture] = useState<ShapesDocument[]>([]);
  const [status, setStatus] = useState<"Saved"|"Unsaved">("Saved");
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<any>(null);
  const panRef = useRef<any>(null);
  const docRef = useRef(doc);
  docRef.current = doc;

  const selected = doc.shapes.find(s => s.id === selectedId) ?? null;
  const updateDoc = useCallback((next: ShapesDocument, recordHistory = true) => {
    if (recordHistory) {
      setHistory(h => [...h.slice(-49), clone(docRef.current)]);
      setFuture([]);
    }
    docRef.current = next;
    setDoc(next);
    setStatus("Unsaved");
  }, []);

  useEffect(() => {
    if (!onDocumentChange || status !== "Unsaved") return;
    const timer = setTimeout(() => {
      onDocumentChange(docRef.current);
      setStatus("Saved");
    }, 800);
    return () => clearTimeout(timer);
  }, [doc, onDocumentChange, status]);

  const point = (e: React.PointerEvent | React.MouseEvent) => {
    const rect = svgRef.current!.getBoundingClientRect();
    return { x: (e.clientX - rect.left - offset.x) / zoom, y: (e.clientY - rect.top - offset.y) / zoom };
  };
  const setSelected = (id:string) => setSelectedId(id);

  const chooseShape = (kind: ShapeKind) => {
    setDrawKind(kind); setTool("draw"); setLibraryOpen(false); setSelectedId(null);
  };

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button === 2) { panRef.current = {cx:e.clientX,cy:e.clientY,ox:offset.x,oy:offset.y}; e.currentTarget.setPointerCapture(e.pointerId); return; }
    if (tool === "pan" || e.button === 1) { panRef.current = {cx:e.clientX,cy:e.clientY,ox:offset.x,oy:offset.y}; e.currentTarget.setPointerCapture(e.pointerId); return; }
    const target = (e.target as Element).closest("[data-shape-id]") as Element | null;
    if (tool === "connect" && target) {
      const id = target.getAttribute("data-shape-id")!;
      if (!connectorStart) setConnectorStart(id);
      else if (connectorStart !== id) {
        const c: ShapeConnector = { id:uid(), fromId:connectorStart, toId:id, stroke:"#64748B", strokeWidth:2, startArrow:false, endArrow:true, dashed:false, label:"" };
        updateDoc({...doc, connectors:[...doc.connectors,c]}); setConnectorStart(null); setTool("select");
      }
      return;
    }
    if (tool === "draw" && drawKind) {
      const p = point(e);
      setDraft({x:p.x,y:p.y,w:0,h:0});
      dragRef.current = { mode:"draw", start:p, kind:drawKind };
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }
    if (!target) { setSelectedId(null); return; }
    const id = target.getAttribute("data-shape-id")!;
    const shape = doc.shapes.find(s => s.id === id);
    if (!shape || shape.locked) { setSelectedId(id); return; }
    setSelectedId(id);
    dragRef.current = {mode:"move",id,start:point(e),x:shape.x,y:shape.y};
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (panRef.current) {
      setOffset({x:panRef.current.ox + e.clientX-panRef.current.cx, y:panRef.current.oy + e.clientY-panRef.current.cy});
      return;
    }
    if (!dragRef.current) return;
    const p = point(e), d = dragRef.current;
    if (d.mode === "draw") setDraft({x:Math.min(d.start.x,p.x),y:Math.min(d.start.y,p.y),w:Math.abs(p.x-d.start.x),h:Math.abs(p.y-d.start.y)});
    if (d.mode === "move") {
      const dx=p.x-d.start.x, dy=p.y-d.start.y;
      setDoc(prev=>({...prev,shapes:prev.shapes.map(s=>s.id===d.id?{...s,x:d.x+dx,y:d.y+dy}:s)}));
      setStatus("Unsaved");
    }
    if (d.mode === "resize") {
      const dx=p.x-d.start.x, dy=p.y-d.start.y;
      setDoc(prev=>({...prev,shapes:prev.shapes.map(s=>{
        if(s.id!==d.id)return s;
        const nw=clamp(d.w+dx,24,3000), nh=clamp(d.h+dy,24,3000);
        return {...s,width:nw,height:nh};
      })}));
      setStatus("Unsaved");
    }
  };

  const onPointerUp = () => {
    if (panRef.current) { panRef.current=null; return; }
    const d=dragRef.current;
    if (!d) return;
    if(d.mode==="draw" && draft && d.kind) {
      const def=getShapeDefinition(d.kind);
      const w=draft.w<8?(def.defaultWidth??140):Math.max(24,draft.w);
      const h=draft.h<8?(def.defaultHeight??80):Math.max(24,draft.h);
      const s=makeShape(d.kind,draft.x,draft.y);
      s.width=w; s.height=h;
      updateDoc({...docRef.current,shapes:[...docRef.current.shapes,s]},true);
      setSelectedId(s.id); setDraft(null); setTool("select"); setDrawKind(null);
    } else if(d.mode==="move" || d.mode==="resize") {
      setHistory(h=>[...h.slice(-49),clone(docRef.current)]); setFuture([]);
    }
    dragRef.current=null;
  };

  const startResize = (e:React.PointerEvent, handle:string) => {
    e.stopPropagation();
    if(!selected || selected.locked)return;
    dragRef.current={mode:"resize",id:selected.id,handle,start:point(e),x:selected.x,y:selected.y,w:selected.width,h:selected.height};
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  };

  const updateSelected = (patch:Partial<ChartShape>) => {
    if(!selected)return;
    updateDoc({...doc,shapes:doc.shapes.map(s=>s.id===selected.id?{...s,...patch}:s)});
  };
  const deleteSelected = () => {
    if(!selectedId)return;
    updateDoc({...doc,shapes:doc.shapes.filter(s=>s.id!==selectedId),connectors:doc.connectors.filter(c=>c.fromId!==selectedId&&c.toId!==selectedId)});
    setSelectedId(null);
  };
  const undo = () => {
    if(!history.length)return;
    const previous=history[history.length-1];
    setFuture(f=>[clone(doc),...f]); setHistory(h=>h.slice(0,-1)); setDoc(previous); docRef.current=previous; setStatus("Unsaved");
  };
  const redo = () => {
    if(!future.length)return;
    const next=future[0]; setHistory(h=>[...h,clone(doc)]); setFuture(f=>f.slice(1)); setDoc(next); docRef.current=next; setStatus("Unsaved");
  };

  useEffect(()=>{
    const key=(e:KeyboardEvent)=>{
      const tag=(e.target as HTMLElement)?.tagName;
      if(tag==="INPUT"||tag==="TEXTAREA"||tag==="SELECT")return;
      if((e.key==="Delete"||e.key==="Backspace")&&selectedId){e.preventDefault();deleteSelected();}
      if(e.key==="Escape"){setDraft(null);setTool("select");setDrawKind(null);setConnectorStart(null);}
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="z"){e.preventDefault();e.shiftKey?redo():undo();}
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="y"){e.preventDefault();redo();}
      if(e.key==="+"||e.key==="=")setZoom(z=>Math.min(5,z*1.1));
      if(e.key==="-")setZoom(z=>Math.max(.1,z/1.1));
      if(e.key.toLowerCase()==="v")setTool("select");
      if(e.key.toLowerCase()==="h")setTool("pan");
    };
    window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key);
  },[selectedId,history,future,doc]);

  const exportSvg = () => {
    if(!svgRef.current)return "";
    const svg=svgRef.current.cloneNode(true) as SVGSVGElement;
    svg.setAttribute("xmlns","http://www.w3.org/2000/svg");
    svg.setAttribute("width","1600");svg.setAttribute("height","1000");
    svg.setAttribute("viewBox","0 0 1600 1000");
    svg.querySelectorAll(".editor-only").forEach(n=>n.remove());
    return new XMLSerializer().serializeToString(svg);
  };
  const exportPdf = () => {
    const svg=exportSvg();
    if(onExportPdf){onExportPdf(doc,svg);return;}
    const win=window.open("","_blank");
    if(!win){alert("Please allow pop-ups to export/print the chart.");return;}
    win.document.write(`<html><head><title>Organization Chart</title><style>@page{size:A3 landscape;margin:8mm}body{margin:0}svg{width:100%;height:auto;max-height:95vh}</style></head><body>${svg}</body></html>`);
    win.document.close();win.focus();setTimeout(()=>win.print(),250);
  };

  const filtered = useMemo(()=>SHAPE_REGISTRY.filter(s=>(s.label+" "+s.description).toLowerCase().includes(search.toLowerCase())),[search]);
  const connectorLines = doc.connectors.map(c=>{
    const a=doc.shapes.find(s=>s.id===c.fromId), b=doc.shapes.find(s=>s.id===c.toId);
    if(!a||!b)return null;
    return <g key={c.id} className="shape-connector"><line x1={a.x+a.width/2} y1={a.y+a.height/2} x2={b.x+b.width/2} y2={b.y+b.height/2} stroke={c.stroke} strokeWidth={c.strokeWidth} strokeDasharray={c.dashed?"6 4":undefined} markerEnd="url(#shape-arrow)"/>{c.label&&<text x={(a.x+b.x+a.width+b.width)/4} y={(a.y+b.y+a.height+b.height)/4} fontSize="12">{c.label}</text>}</g>;
  });

  const handlePoints = selected ? [
    ["nw",selected.x,selected.y],["n",selected.x+selected.width/2,selected.y],["ne",selected.x+selected.width,selected.y],
    ["e",selected.x+selected.width,selected.y+selected.height/2],["se",selected.x+selected.width,selected.y+selected.height],
    ["s",selected.x+selected.width/2,selected.y+selected.height],["sw",selected.x,selected.y+selected.height],["w",selected.x,selected.y+selected.height/2]
  ] as [string,number,number][] : [];

  return <div className={`tv-shapes-editor ${className??""}`}>
    <style>{`
      .tv-shapes-editor{display:flex;min-height:620px;height:calc(100vh - 170px);border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;background:#fff;color:#111827;font:13px Inter,system-ui,sans-serif}
      .tv-shapes-toolbar{width:54px;flex-shrink:0;border-right:1px solid #e5e7eb;background:#fbfcfe;display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 5px}
      .tv-tool{border:1px solid transparent;background:transparent;border-radius:8px;width:40px;height:40px;display:grid;place-items:center;cursor:pointer;color:#475569;font-size:18px}
      .tv-tool:hover,.tv-tool.active{background:#eaf1ff;border-color:#b8cdf8;color:#2455b8}
      .tv-shape-stage{position:relative;flex:1;min-width:0;background-color:#fff;background-image:radial-gradient(#dbe2ec .8px,transparent .8px);background-size:18px 18px;overflow:hidden}
      .tv-shape-stage svg{width:100%;height:100%;touch-action:none;display:block}
      .tv-shape-inspector{width:290px;flex-shrink:0;border-left:1px solid #e5e7eb;padding:16px;overflow:auto;background:#fff}
      .tv-inspector-title{font-size:14px;font-weight:750;margin:0 0 14px}
      .tv-field{display:flex;flex-direction:column;gap:5px;margin:11px 0}.tv-field label{font-size:11px;font-weight:700;color:#475569}
      .tv-field input,.tv-field select,.tv-field textarea{width:100%;box-sizing:border-box;border:1px solid #dbe1ea;border-radius:7px;padding:8px;font:inherit;background:#fff}
      .tv-field input[type=color]{height:34px;padding:3px}.tv-field input[type=range]{padding:0}
      .tv-shape-library{position:absolute;z-index:20;left:10px;top:10px;width:min(440px,calc(100% - 20px));max-height:calc(100% - 20px);overflow:auto;background:#fff;border:1px solid #dbe1ea;border-radius:12px;box-shadow:0 12px 40px #0f172a20;padding:12px}
      .tv-shape-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:10px 0}
      .tv-shape-option{border:1px solid #e2e8f0;border-radius:8px;padding:8px 4px;background:white;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:5px;min-height:74px;color:#334155}
      .tv-shape-option:hover{border-color:#4472c4;background:#f4f7ff}
      .tv-shape-option svg{width:55px;height:34px;color:#4472c4}
      .tv-shape-option span{font-size:10px;text-align:center}
      .tv-status{position:absolute;right:12px;top:10px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:7px 10px;font-size:11px;color:#64748b;z-index:2}
      .tv-canvas-controls{position:absolute;right:12px;bottom:12px;display:flex;gap:5px;background:white;border:1px solid #e2e8f0;border-radius:9px;padding:5px;z-index:2}
      .tv-canvas-controls button,.tv-actions button{border:1px solid #e2e8f0;border-radius:6px;background:white;padding:7px 9px;cursor:pointer}
      .tv-primary{background:#4472c4!important;color:white;border-color:#4472c4!important}
      .tv-actions{display:flex;flex-wrap:wrap;gap:6px;margin:14px 0}
      .tv-muted{color:#64748b;font-size:11px;line-height:1.5}
      @media(max-width:900px){.tv-shape-inspector{width:235px}.tv-shape-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    `}</style>
    <aside className="tv-shapes-toolbar" aria-label="Canvas tools">
      <button className={`tv-tool ${tool==="select"?"active":""}`} title="Select (V)" onClick={()=>{setTool("select");setLibraryOpen(false)}}>↖</button>
      <button className={`tv-tool ${tool==="pan"?"active":""}`} title="Pan (H)" onClick={()=>setTool("pan")}>✋</button>
      <button className={`tv-tool ${libraryOpen||tool==="draw"?"active":""}`} title="Shapes" onClick={()=>{setLibraryOpen(v=>!v);setTool("select")}}>
        <svg viewBox="0 0 32 32" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="2.8"><rect x="2" y="2" width="13" height="12"/><circle cx="22" cy="9" r="6"/><path d="M7 29 L15 16 L23 29 Z"/></svg>
      </button>
      <button className={`tv-tool ${tool==="connect"?"active":""}`} title="Connect shapes" onClick={()=>{setTool("connect");setConnectorStart(null)}}>⌁</button>
      <div style={{height:1,background:"#e2e8f0",width:"100%",margin:"4px 0"}}/>
      <button className="tv-tool" title="Undo (Ctrl+Z)" onClick={undo} disabled={!history.length}>↶</button>
      <button className="tv-tool" title="Redo (Ctrl+Shift+Z)" onClick={redo} disabled={!future.length}>↷</button>
      <button className="tv-tool" title="Delete selected" onClick={deleteSelected}>⌫</button>
      <div style={{flex:1}}/>
      <button className="tv-tool" title="Export PDF" onClick={exportPdf}>⇩</button>
    </aside>
    <main className="tv-shape-stage" onContextMenu={e=>e.preventDefault()}>
      <div className="tv-status">{status} · {Math.round(zoom*100)}%</div>
      {libraryOpen&&<div className="tv-shape-library">
        <div style={{display:"flex",gap:8,alignItems:"center"}}><strong style={{flex:1}}>Shapes library</strong><button onClick={()=>setLibraryOpen(false)}>✕</button></div>
        <input aria-label="Search shapes" placeholder="Search shapes…" value={search} onChange={e=>setSearch(e.target.value)} style={{width:"100%",boxSizing:"border-box",marginTop:10,padding:9,border:"1px solid #dbe1ea",borderRadius:7}}/>
        {SHAPE_CATEGORIES.map(category=>{
          const items=filtered.filter(s=>s.category===category);
          return items.length?<section key={category}><div style={{fontWeight:750,fontSize:11,color:"#64748b",marginTop:12}}>{category}</div><div className="tv-shape-grid">{items.map(item=><button key={item.kind} className="tv-shape-option" title={item.description} onClick={()=>chooseShape(item.kind)}>
            <svg viewBox="0 0 100 60" aria-hidden="true"><g transform="translate(10 8) scale(.8 .72)" fill="#dbeafe" stroke="#4472c4" strokeWidth="2">{previewGeometry(item.kind)}</g></svg><span>{item.label}</span>
          </button>)}</div></section>:null;
        })}
      </div>}
      <svg ref={svgRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
        onWheel={e=>{if(e.ctrlKey||e.metaKey){e.preventDefault();setZoom(z=>clamp(z*(e.deltaY<0?1.1:.9),.1,5));}}}
        viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid meet" role="application" aria-label="Editable vector shape canvas">
        <ShapeDefs/>
        <g transform={`translate(${offset.x} ${offset.y}) scale(${zoom})`}>
          {connectorLines}
          {doc.shapes.slice().sort((a,b)=>a.zIndex-b.zIndex).map(shape=><g key={shape.id} data-shape-id={shape.id} transform={`translate(${shape.x} ${shape.y}) rotate(${shape.rotation} ${shape.width/2} ${shape.height/2})`} style={{cursor:tool==="select"?"move":"crosshair"}}>
            <ShapeGeometry shape={shape}/>
            {selectedId===shape.id&&<g className="editor-only">
              <rect x="-3" y="-3" width={shape.width+6} height={shape.height+6} fill="none" stroke="#4472c4" strokeWidth={1.5/zoom} strokeDasharray={`${5/zoom} ${3/zoom}`} pointerEvents="none"/>
              {handlePoints.map(([name,x,y])=><rect key={name} x={x-shape.x-4/zoom} y={y-shape.y-4/zoom} width={8/zoom} height={8/zoom} rx={1/zoom} fill="white" stroke="#4472c4" strokeWidth={1.5/zoom} style={{cursor:"nwse-resize",pointerEvents:"all"}} onPointerDown={e=>startResize(e,name)}/>)}
            </g>}
          </g>)}
          {draft&&drawKind&&<g transform={`translate(${draft.x} ${draft.y})`}><rect width={Math.max(draft.w,1)} height={Math.max(draft.h,1)} fill="#dbeafe" fillOpacity=".45" stroke="#4472c4" strokeDasharray="5 4"/></g>}
        </g>
      </svg>
      <div className="tv-canvas-controls"><button onClick={()=>setZoom(z=>clamp(z/1.1,.1,5))}>−</button><span style={{padding:"7px 3px",minWidth:40,textAlign:"center"}}>{Math.round(zoom*100)}%</span><button onClick={()=>setZoom(z=>clamp(z*1.1,.1,5))}>+</button><button onClick={()=>{setZoom(1);setOffset({x:0,y:0})}}>Reset</button><button onClick={()=>{setZoom(1);setOffset({x:0,y:0})}}>Fit</button></div>
    </main>
    <aside className="tv-shape-inspector">
      <h3 className="tv-inspector-title">{selected?getShapeDefinition(selected.kind).label:"Shape properties"}</h3>
      {!selected?<div className="tv-muted">Select a shape to edit its properties, or open the Shapes tool to add a new vector shape.<div className="tv-actions"><button className="tv-primary" onClick={()=>setLibraryOpen(true)}>＋ Add shape</button></div><p>Tip: choose a shape, then drag on the canvas. Right-click and drag to pan.</p><p>Connect mode: choose the tool, then click a source shape and a target shape.</p></div>:<>
        <Field label="Text / label"><textarea rows={3} value={selected.text} onChange={e=>updateSelected({text:e.target.value})}/></Field>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><Field label="X"><input type="number" value={Math.round(selected.x)} onChange={e=>updateSelected({x:Number(e.target.value)})}/></Field><Field label="Y"><input type="number" value={Math.round(selected.y)} onChange={e=>updateSelected({y:Number(e.target.value)})}/></Field><Field label="Width"><input type="number" min="24" value={Math.round(selected.width)} onChange={e=>updateSelected({width:Math.max(24,Number(e.target.value))})}/></Field><Field label="Height"><input type="number" min="24" value={Math.round(selected.height)} onChange={e=>updateSelected({height:Math.max(24,Number(e.target.value))})}/></Field></div>
        <Field label="Fill color"><input type="color" value={selected.fill==="transparent"?"#ffffff":selected.fill} onChange={e=>updateSelected({fill:e.target.value})}/></Field>
        <Field label={`Fill opacity · ${Math.round(selected.fillOpacity*100)}%`}><input type="range" min="0" max="100" value={selected.fillOpacity*100} onChange={e=>updateSelected({fillOpacity:Number(e.target.value)/100})}/></Field>
        <Field label="Stroke color"><input type="color" value={selected.stroke} onChange={e=>updateSelected({stroke:e.target.value})}/></Field>
        <Field label="Stroke width"><input type="number" min="0" max="20" value={selected.strokeWidth} onChange={e=>updateSelected({strokeWidth:Math.max(0,Number(e.target.value))})}/></Field>
        <Field label="Stroke style"><select value={selected.strokeStyle} onChange={e=>updateSelected({strokeStyle:e.target.value as ChartShape["strokeStyle"]})}><option value="solid">Solid</option><option value="dashed">Dashed</option><option value="dotted">Dotted</option></select></Field>
        <Field label="Text color"><input type="color" value={selected.textColor} onChange={e=>updateSelected({textColor:e.target.value})}/></Field>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><Field label="Font size"><input type="number" min="8" max="96" value={selected.fontSize} onChange={e=>updateSelected({fontSize:clamp(Number(e.target.value),8,96)})}/></Field><Field label="Font weight"><select value={selected.fontWeight} onChange={e=>updateSelected({fontWeight:Number(e.target.value)})}><option value="400">Regular</option><option value="500">Medium</option><option value="600">Semibold</option><option value="700">Bold</option></select></Field></div>
        <Field label="Text alignment"><select value={selected.textAlign} onChange={e=>updateSelected({textAlign:e.target.value as ChartShape["textAlign"]})}><option value="start">Left</option><option value="middle">Center</option><option value="end">Right</option></select></Field>
        <Field label="Rotation (degrees)"><input type="number" min="-360" max="360" value={selected.rotation} onChange={e=>updateSelected({rotation:Number(e.target.value)})}/></Field>
        <Field label="Layer order"><div className="tv-actions"><button onClick={()=>updateSelected({zIndex:Math.max(...doc.shapes.map(s=>s.zIndex))+1})}>Bring forward</button><button onClick={()=>updateSelected({zIndex:Math.min(...doc.shapes.map(s=>s.zIndex))-1})}>Send back</button></div></Field>
        <Field label="Lock shape"><input type="checkbox" checked={selected.locked} onChange={e=>updateSelected({locked:e.target.checked})}/></Field>
        <div className="tv-actions"><button onClick={()=>{const copyShape={...selected,id:uid(),x:selected.x+24,y:selected.y+24,zIndex:Date.now()};updateDoc({...doc,shapes:[...doc.shapes,copyShape]});setSelectedId(copyShape.id)}}>Duplicate</button><button onClick={deleteSelected}>Delete</button></div>
      </>}
      <div className="tv-actions"><button onClick={exportPdf}>Export PDF</button><button onClick={()=>{setLibraryOpen(true);setTool("select")}}>Shape library</button></div>
      <p className="tv-muted">Autosave status: {status}. Connect <code>onDocumentChange</code> to your existing chart persistence layer.</p>
    </aside>
  </div>;
}

function Field({label,children}:{label:string;children:React.ReactNode}) {
  return <div className="tv-field"><label>{label}</label>{children}</div>;
}

function previewGeometry(kind:ShapeKind) {
  // Mini previews intentionally use the same broad visual language as the full registry.
  switch(kind) {
    case "terminator": return <rect x="2" y="8" width="96" height="44" rx="22"/>;
    case "decision": case "diamond": case "sort": return <polygon points="50,2 98,30 50,58 2,30"/>;
    case "delay": return <path d="M2 8 H70 A22 22 0 0 1 70 52 H2 Z"/>;
    case "data": return <polygon points="20,5 98,5 80,55 2,55"/>;
    case "document": return <path d="M2 4 H98 V42 Q72 62 50 46 Q25 32 2 48 Z"/>;
    case "subroutine": return <g><rect x="2" y="5" width="96" height="50"/><path d="M14 5 V55 M86 5 V55"/></g>;
    case "preparation": case "hexagon": return <polygon points="20,4 80,4 98,30 80,56 20,56 2,30"/>;
    case "triangle": case "merge": return <polygon points="50,58 2,2 98,2"/>;
    case "database": return <g><path d="M2 12 C2 -2 98 -2 98 12 V48 C98 62 2 62 2 48 Z"/><ellipse cx="50" cy="12" rx="48" ry="12"/></g>;
    case "connector": case "or": case "summing-junction": return <circle cx="50" cy="30" r="27"/>;
    case "line": return <path d="M2 30 H98"/>;
    case "arrow": return <path d="M2 30 H88 M76 18 L98 30 L76 42"/>;
    case "double-arrow": return <path d="M14 18 L2 30 L14 42 M2 30 H98 M86 18 L98 30 L86 42"/>;
    case "off-page-down": return <polygon points="2,4 98,4 98,38 50,58 2,38"/>;
    case "off-page-up": return <polygon points="50,2 98,22 98,56 2,56 2,22"/>;
    case "off-page-left": return <polygon points="2,30 25,4 98,4 98,56 25,56"/>;
    case "off-page-right": return <polygon points="2,4 75,4 98,30 75,56 2,56"/>;
    case "collate": return <g><polygon points="2,2 98,2 50,30"/><polygon points="2,58 98,58 50,30"/></g>;
    case "manual-input": return <polygon points="2,20 98,2 98,58 2,58"/>;
    case "manual-loop": return <polygon points="2,2 98,2 80,58 20,58"/>;
    case "loop-limit": return <polygon points="12,2 88,2 98,12 98,48 88,58 12,58 2,48 2,12"/>;
    case "stored-data": return <path d="M2 2 H75 C105 2 105 58 75 58 H2 C20 58 20 2 2 2 Z"/>;
    case "multiple-documents": return <g><rect x="10" y="2" width="82" height="48"/><path d="M2 10 H84 V48 Q45 62 2 48 Z"/></g>;
    case "internal-storage": return <g><rect x="2" y="2" width="96" height="56"/><path d="M12 2 V12 M2 12 H98"/></g>;
    case "display": return <path d="M20 2 H80 Q98 2 98 30 Q98 58 80 58 H20 Q2 58 2 30 Q2 2 20 2 Z"/>;
    case "text": return <text x="50" y="35" textAnchor="middle" fill="#4472c4" stroke="none" fontSize="18">T</text>;
    default: return <rect x="2" y="5" width="96" height="50" rx={kind==="rounded-rectangle"?12:0}/>;
  }
}
