import { useRef, useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Info, ExternalLink } from 'lucide-react';
import * as d3 from 'd3';
import './IdeaMap.css';

export interface IdeaPoint {
    id: number;
    title: string;
    description: string;
    x: number;
    y: number;
    improves_project_id?: number | null;
    category?: string | null;
    category_color?: string | null;
}

interface IdeaMapProps {
    points: IdeaPoint[];
    myPoint?: { x: number; y: number } | null;
    connections?: { targetId: number; strength: number }[];
    onPointClick?: (point: IdeaPoint) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
    'financie a bankovníctvo': '#10B981',
    'zdravotníctvo a wellness': '#EF4444',
    'vzdelávanie': '#F59E0B',
    'e-commerce a maloobchod': '#EC4899',
    'zdieľaná ekonomika': '#8B5CF6',
    'doprava, mobilita a logistika': '#06B6D4',
    'nehnuteľnosti a bývanie': '#6366F1',
    'jedlo, nápoje a poľnohospodárstvo': '#84CC16',
    'cestovanie a voľný čas': '#F97316',
    'životné prostredie a udržateľnosť': '#14B8A6',
    'práca, marketing a firemné nástroje': '#3B82F6',
    'sociálne siete a komunita': '#A855F7',
    'zábava, médiá a hry': '#D946EF',
    'bezpečnosť': '#64748B',
    'umelá inteligencia a dáta': '#0284C7',
};

function getCategoryColor(category?: string | null, category_color?: string | null): string {
    if (category_color) return category_color;
    if (!category) return '#1594c7';
    const key = category.trim().toLowerCase();
    return CATEGORY_COLORS[key] || '#1594c7';
}

function IdeaMap({ points, myPoint, connections, onPointClick }: IdeaMapProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const svgRef = useRef<SVGSVGElement>(null);
    const gRef = useRef<SVGGElement>(null);
    const transformRef = useRef(d3.zoomIdentity);
    const containerRef = useRef<HTMLDivElement>(null);

    const [hovered, setHovered] = useState<IdeaPoint | null>(null);
    const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
    const [, setTransform] = useState(d3.zoomIdentity);
    const [dims, setDims] = useState({ width: 800, height: 600 });
    const [legendOpen, setLegendOpen] = useState(false);
    const [pinnedId, setPinnedId] = useState<number | null>(null);

    const connectedIds = useMemo(() => {
        const map = new Map<number, number>();
        connections?.forEach((c) => map.set(c.targetId, c.strength));
        return map;
    }, [connections]);

    // Resize observer
    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            if (width > 0 && height > 0) {
                setDims({ width, height });
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Natural Zoom & Pan behavior
    useEffect(() => {
        if (!svgRef.current || !gRef.current) return;
        const svg = d3.select(svgRef.current);
        const g = gRef.current;

        const zoomBehavior = d3
            .zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.4, 8])
            .on('zoom', (event) => {
                g.setAttribute('transform', event.transform.toString());
                transformRef.current = event.transform;
            })
            .on('end', () => {
                setTransform(transformRef.current);
            });

        svg.call(zoomBehavior);

        return () => {
            svg.on('.zoom', null);
        };
    }, []);

    // Direct authentic SMACOF projection with 1:1 aspect ratio:
    // Preserves true semantic distance (closer = more similar, natural clusters)
    const nodeMap = useMemo(() => {
        const map = new Map<number, { x: number; y: number }>();
        if (!points || points.length === 0) return map;

        const xs = points.map((p) => p.x);
        const ys = points.map((p) => p.y);
        if (myPoint) {
            xs.push(myPoint.x);
            ys.push(myPoint.y);
        }

        const [minX, maxX] = d3.extent(xs) as [number, number];
        const [minY, maxY] = d3.extent(ys) as [number, number];

        const xSpan = Math.max(maxX - minX, 0.001);
        const ySpan = Math.max(maxY - minY, 0.001);

        // Usable area: comfortable padding, leaving space for bottom card
        const padX = 28;
        const padTop = 28;
        const padBottom = 160;
        const usableWidth = Math.max(dims.width - padX * 2, 200);
        const usableHeight = Math.max(dims.height - padTop - padBottom, 200);

        // Uniform 1:1 aspect ratio scaling with natural 1.65x dispersion
        const scale = Math.min(usableWidth / xSpan, usableHeight / ySpan) * 1.65;

        const midX = (minX + maxX) / 2;
        const midY = (minY + maxY) / 2;
        const centerCanvasX = dims.width / 2;
        const centerCanvasY = padTop + usableHeight / 2;

        points.forEach((p) => {
            map.set(p.id, {
                x: centerCanvasX + (p.x - midX) * scale,
                y: centerCanvasY - (p.y - midY) * scale,
            });
        });

        if (myPoint) {
            map.set(-999, {
                x: centerCanvasX + (myPoint.x - midX) * scale,
                y: centerCanvasY - (myPoint.y - midY) * scale,
            });
        }

        return map;
    }, [points, myPoint, dims]);

    const showTooltip = (p: IdeaPoint, clientX: number, clientY: number) => {
        setHovered(p);
        const container = containerRef.current?.getBoundingClientRect();
        if (!container) return;

        const tooltipWidth = 240;
        const tooltipHeight = 110;

        let x = clientX + 16 - container.left;
        let y = clientY + 16 - container.top;

        x = Math.min(x, container.width - tooltipWidth - 12);
        y = Math.min(y, container.height - tooltipHeight - 12);

        setHoverPos({ x: Math.max(x, 12), y: Math.max(y, 12) });
    };

    const myPos = nodeMap.get(-999);

    return (
        <div className="ideaMapContainer" ref={containerRef}>


            {/* Top-Right Single Info/Legend Button */}
            <div className="ideaMapLegendWrapper">
                <button
                    type="button"
                    className={`ideaMapLegendToggle ${legendOpen ? 'ideaMapLegendToggle--active' : ''}`}
                    onClick={() => setLegendOpen((prev) => !prev)}
                    aria-expanded={legendOpen}
                    title={t('map_legend_toggle')}
                    aria-label={t('map_legend_toggle')}
                >
                    <Info size={18} />
                </button>

                {legendOpen && (
                    <div className="ideaMapLegendCard">
                        <div className="legendRow">
                            <span className="legendIconSlot">
                                <span className="legendMarker legendMarker--draft">
                                    <span className="legendDotCenter" />
                                </span>
                            </span>
                            <span className="legendText">{t('map_legend_your_idea')}</span>
                        </div>
                        <div className="legendRow">
                            <span className="legendIconSlot">
                                <span className="legendMarker legendMarker--base" />
                            </span>
                            <span className="legendText">{t('map_legend_project')}</span>
                        </div>
                        <div className="legendRow">
                            <span className="legendIconSlot">
                                <span className="legendMarker legendMarker--child">
                                    <span className="legendDotInner" />
                                </span>
                            </span>
                            <span className="legendText">{t('map_legend_improvement')}</span>
                        </div>
                        <div className="legendRow">
                            <span className="legendIconSlot">
                                <span className="legendMarker legendMarker--similar" />
                            </span>
                            <span className="legendText">{t('map_legend_similar_project')}</span>
                        </div>
                        <div className="legendRow">
                            <span className="legendIconSlot">
                                <svg width="18" height="10" viewBox="0 0 18 10" fill="none">
                                    <path d="M 0 5 L 12 5" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="3 2" />
                                    <path d="M 10 2 L 16 5 L 10 8 Z" fill="#8b5cf6" />
                                </svg>
                            </span>
                            <span className="legendText">{t('map_legend_evolution')}</span>
                        </div>
                    </div>
                )}
            </div>

            <svg
                ref={svgRef}
                className="ideaMapSvg"
                width={dims.width}
                height={dims.height}
                onPointerDown={(e) => {
                    if ((e.target as SVGElement).closest('.ideaPointGroup')) return;
                    setPinnedId(null);
                    setHovered(null);
                }}
            >
                <defs>
                    <marker
                        id="improveArrow"
                        viewBox="0 0 10 10"
                        refX="5"
                        refY="5"
                        markerWidth="5"
                        markerHeight="5"
                        orient="auto"
                    >
                        <path d="M 0 1.5 L 6 5 L 0 8.5 z" fill="#8b5cf6" />
                    </marker>
                </defs>

                <g ref={gRef}>
                    {/* Improvement evolution lines: Base Project -> Improved Project */}
                    {points.map((p) => {
                        if (!p.improves_project_id) return null;
                        const base = points.find((target) => target.id === p.improves_project_id);
                        if (!base) return null;

                        const basePos = nodeMap.get(base.id);
                        const childPos = nodeMap.get(p.id);
                        if (!basePos || !childPos) return null;

                        const x1 = basePos.x, y1 = basePos.y;
                        const x2 = childPos.x, y2 = childPos.y;
                        const dist = Math.hypot(x2 - x1, y2 - y1);
                        if (dist < 26) return null;

                        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
                        const dx = x2 - x1, dy = y2 - y1;
                        const curveOffset = 0.08;
                        const cx = mx - dy * curveOffset;
                        const cy = my + dx * curveOffset;

                        const startDist = Math.hypot(cx - x1, cy - y1);
                        const startPad = 10;
                        const sx = x1 + ((cx - x1) / (startDist || 1)) * startPad;
                        const sy = y1 + ((cy - y1) / (startDist || 1)) * startPad;

                        const endDist = Math.hypot(x2 - cx, y2 - cy);
                        const endPad = 12;
                        const ex = x2 - ((x2 - cx) / (endDist || 1)) * endPad;
                        const ey = y2 - ((y2 - cy) / (endDist || 1)) * endPad;

                        return (
                            <path
                                key={`improve-${base.id}-${p.id}`}
                                d={`M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`}
                                fill="none"
                                className="improveLine"
                                markerEnd="url(#improveArrow)"
                            />
                        );
                    })}

                    {/* Neighbor connection lines from user draft to similar projects */}
                    {myPos && connections?.map((conn) => {
                        const targetPos = nodeMap.get(conn.targetId);
                        if (!targetPos) return null;

                        const x1 = myPos.x, y1 = myPos.y;
                        const x2 = targetPos.x, y2 = targetPos.y;
                        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
                        const dx = x2 - x1, dy = y2 - y1;
                        const curveOffset = 0.1;
                        const cx = mx - dy * curveOffset;
                        const cy = my + dx * curveOffset;

                        return (
                            <path
                                key={conn.targetId}
                                d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
                                fill="none"
                                className="connectionLine"
                                strokeOpacity={0.3 + (conn.strength / 100) * 0.55}
                                strokeWidth={0.9 + (conn.strength / 100) * 1.8}
                            />
                        );
                    })}

                    {/* Project Nodes with genuine semantic positions */}
                    {points.map((p) => {
                        const pos = nodeMap.get(p.id);
                        if (!pos) return null;
                        const cx = pos.x;
                        const cy = pos.y;

                        const strength = connectedIds.get(p.id);
                        const isConnected = strength !== undefined;
                        const isChildProject = Boolean(p.improves_project_id);
                        const pointColor = getCategoryColor(p.category, p.category_color);

                        return (
                            <g
                                key={p.id}
                                className="ideaPointGroup"
                                onPointerEnter={(e) => {
                                    if (e.pointerType === 'touch') return;
                                    showTooltip(p, e.clientX, e.clientY);
                                }}
                                onPointerMove={(e) => {
                                    if (e.pointerType === 'touch') return;
                                    showTooltip(p, e.clientX, e.clientY);
                                }}
                                onPointerLeave={(e) => {
                                    if (e.pointerType === 'touch') return;
                                    setHovered(null);
                                }}
                                onClick={(e) => {
                                    if (pinnedId === p.id) {
                                        setPinnedId(null);
                                        setHovered(null);
                                    } else {
                                        setPinnedId(p.id);
                                        showTooltip(p, e.clientX, e.clientY);
                                    }
                                    onPointClick?.(p);
                                }}
                            >
                                {isChildProject ? (
                                    <>
                                        {/* Outer ring for improved project */}
                                        <circle
                                            cx={cx}
                                            cy={cy}
                                            r={isConnected ? 8.5 : 7}
                                            fill="transparent"
                                            stroke={pointColor}
                                            strokeWidth={1.75}
                                            strokeOpacity={isConnected ? 0.95 : 0.75}
                                            className="ideaPointRing"
                                        />
                                        {/* Center dot */}
                                        <circle
                                            cx={cx}
                                            cy={cy}
                                            r={isConnected ? 4.4 : 3.8}
                                            fill={pointColor}
                                            fillOpacity={isConnected ? 0.95 : 0.75}
                                            className="ideaPointCenter"
                                        />
                                    </>
                                ) : (
                                    /* Solid dot for parent/base project */
                                    <circle
                                        cx={cx}
                                        cy={cy}
                                        r={isConnected ? 8.5 : 7}
                                        fill={pointColor}
                                        fillOpacity={isConnected ? 0.95 : 0.8}
                                        className="ideaPointCircle"
                                    />
                                )}

                                {isConnected && (
                                    <circle
                                        cx={cx}
                                        cy={cy}
                                        r={8.5}
                                        fill="#5dc193"
                                        className="similarityRing"
                                        stroke="#ffffff"
                                        strokeWidth={1}
                                        strokeOpacity={0.35 + (strength / 100) * 0.5}
                                    />
                                )}
                            </g>
                        );
                    })}

                    {/* Draft Idea Node (My Input) */}
                    {myPos && (
                        <g>
                            <circle
                                cx={myPos.x}
                                cy={myPos.y}
                                r={12}
                                className="myIdeaGlow"
                                fill="none"
                                stroke="#1594C7"
                                strokeWidth={1.8}
                            />
                            <circle
                                cx={myPos.x}
                                cy={myPos.y}
                                r={7.5}
                                fill="#10B981"
                                stroke="#FFFFFF"
                                strokeWidth={1.5}
                                className="draftPoint"
                            />
                        </g>
                    )}
                </g>
            </svg>

            {/* Hover / Tap Tooltip */}
            {hovered && hoverPos && (
                <div
                    className="ideaMapTooltip"
                    style={{ left: hoverPos.x, top: hoverPos.y }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="tooltipHeader">
                        <p className="tooltipTitle">{hovered.title}</p>
                        {hovered.category && (() => {
                            const catCol = getCategoryColor(hovered.category, hovered.category_color);
                            return (
                                <span
                                    className="tooltipCategoryPill"
                                    style={{
                                        backgroundColor: `${catCol}20`,
                                        color: catCol,
                                        borderColor: `${catCol}40`,
                                    }}
                                >
                                    {hovered.category}
                                </span>
                            );
                        })()}
                    </div>
                    {hovered.description && (
                        <p className="tooltipDesc">{hovered.description}</p>
                    )}
                    <button
                        type="button"
                        className="tooltipActionBtn"
                        onClick={() => navigate(`/project/${hovered.id}`)}
                    >
                        <span>{t('map_open_project')}</span>
                        <ExternalLink size={12} />
                    </button>
                </div>
            )}
        </div>
    );
}

export default IdeaMap;