import { useRef, useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
    'Informačné technológie': '#1594c7',
    'Ekonomika a financie': '#16a34a',
    'Smart Campus': '#8b5cf6',
    'Vzdelávanie': '#f59e0b',
    'IoT a Hardvér': '#ea580c',
};

function getCategoryColor(category: string): string {
    if (CATEGORY_COLORS[category]) return CATEGORY_COLORS[category];
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
        hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['#1594c7', '#16a34a', '#8b5cf6', '#f59e0b', '#ea580c', '#0284c7', '#06b6d4'];
    return colors[Math.abs(hash) % colors.length];
}

function IdeaMap({ points, myPoint, connections, onPointClick }: IdeaMapProps) {
    const { t } = useTranslation();
    const svgRef = useRef<SVGSVGElement>(null);
    const gRef = useRef<SVGGElement>(null);
    const transformRef = useRef(d3.zoomIdentity);
    const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    const [hovered, setHovered] = useState<IdeaPoint | null>(null);
    const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
    const [, setTransform] = useState(d3.zoomIdentity);
    const [dims, setDims] = useState({ width: 800, height: 600 });

    const connectedIds = useMemo(() => {
        const map = new Map();
        connections?.forEach((c) => map.set(c.targetId, c.strength));
        return map;
    }, [connections]);


    const xExtent = useMemo(() => {
        const xs = points.map((p) => p.x);
        if (myPoint) xs.push(myPoint.x);
        return d3.extent(xs) as [number, number];
    }, [points, myPoint]);

    const yExtent = useMemo(() => {
        const ys = points.map((p) => p.y);
        if (myPoint) ys.push(myPoint.y);
        return d3.extent(ys) as [number, number];
    }, [points, myPoint]);

    const xScale = useMemo(
        () => d3.scaleLinear().domain(xExtent).range([60, dims.width - 60]),
        [xExtent, dims.width]
    );
    const yScale = useMemo(
        () => d3.scaleLinear().domain(yExtent).range([dims.height - 60, 60]),
        [yExtent, dims.height]
    );

    // Resize observer
    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            setDims({ width, height });
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Zoom behavior
    useEffect(() => {
        if (!svgRef.current || !gRef.current) return;
        const svg = d3.select(svgRef.current);
        const g = gRef.current;

        const zoomBehavior = d3
            .zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.5, 8])
            .on('zoom', (event) => {
                // напряму в DOM — без React re-render на кожен frame
                g.setAttribute('transform', event.transform.toString());
                transformRef.current = event.transform;
            })
            .on('end', () => {
                // React state синкаємо один раз, коли жест закінчився
                setTransform(transformRef.current);
            });

        svg.call(zoomBehavior);
        zoomBehaviorRef.current = zoomBehavior;

        return () => {
            svg.on('.zoom', null);
        };
    }, []);

    const [legendOpen, setLegendOpen] = useState(false);
    const [pinnedId, setPinnedId] = useState<number | null>(null);

    const showTooltip = (p: IdeaPoint, clientX: number, clientY: number) => {
        setHovered(p);
        const container = containerRef.current?.getBoundingClientRect();
        if (!container) return;

        const tooltipWidth = 180;
        const tooltipHeight = 40;

        let x = clientX + 14 - container.left;
        let y = clientY + 14 - container.top;

        x = Math.min(x, container.width - tooltipWidth);
        y = Math.min(y, container.height - tooltipHeight);

        setHoverPos({ x: Math.max(x, 8), y: Math.max(y, 8) });
    };

    return (
        <div className="ideaMapContainer" ref={containerRef}>
            {/* Легенда мапи — dropdown */}
            <div className="ideaMapLegendWrapper">
                <button
                    type="button"
                    className="ideaMapLegendToggle"
                    onClick={() => setLegendOpen((prev) => !prev)}
                    aria-expanded={legendOpen}
                    aria-label={t('map_legend_toggle')}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4M12 8h.01" />
                    </svg>
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

                    {/* Стрілки зв'язку покращень: Базовий проєкт ➔ Новий покращений проєкт */}
                    {points.map((p) => {
                        if (!p.improves_project_id) return null;
                        const base = points.find((target) => target.id === p.improves_project_id);
                        if (!base) return null;

                        // Початок (x1, y1) — базовий проєкт (першоджерело)
                        const x1 = xScale(base.x), y1 = yScale(base.y);
                        // Кінець (x2, y2) — новий покращений проєкт (куди веде стрілка)
                        const x2 = xScale(p.x), y2 = yScale(p.y);
                        const dist = Math.hypot(x2 - x1, y2 - y1);
                        if (dist < 28) return null;

                        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
                        const dx = x2 - x1, dy = y2 - y1;
                        const curveOffset = 0.08;
                        const cx = mx - dy * curveOffset;
                        const cy = my + dx * curveOffset;

                        // Відступ від базового проєкту
                        const startDist = Math.hypot(cx - x1, cy - y1);
                        const startPad = 9;
                        const sx = x1 + ((cx - x1) / (startDist || 1)) * startPad;
                        const sy = y1 + ((cy - y1) / (startDist || 1)) * startPad;

                        // Відступ перед покращеним проєктом (стрілка вказує на нього)
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

                    {/* Лінії до найближчих сусідів — рендеряться першими */}
                    {myPoint && connections?.map((conn) => {
                        const target = points.find((p) => p.id === conn.targetId);
                        if (!target) return null;

                        const x1 = xScale(myPoint.x), y1 = yScale(myPoint.y);
                        const x2 = xScale(target.x), y2 = yScale(target.y);
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
                                strokeOpacity={0.25 + (conn.strength / 100) * 0.6}
                                strokeWidth={0.8 + (conn.strength / 100) * 2}
                            />
                        );
                    })}

                    {/* Існуючі проекти */}
                    {points.map((p) => {
                        const cx = xScale(p.x);
                        const cy = yScale(p.y);
                        const strength = connectedIds.get(p.id);
                        const isConnected = strength !== undefined;
                        const isChildProject = Boolean(p.improves_project_id);

                        const pointColor = p.category_color || (p.category ? getCategoryColor(p.category) : '#1594C7');

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
                                            r={isConnected ? 8 : 7}
                                            fill="transparent"
                                            stroke={pointColor}
                                            strokeWidth={1.5}
                                            strokeOpacity={isConnected ? 0.85 : 0.65}
                                            className="ideaPointRing"
                                        />
                                        {/* Center dot */}
                                        <circle
                                            cx={cx}
                                            cy={cy}
                                            r={isConnected ? 4.2 : 3.8}
                                            fill={pointColor}
                                            fillOpacity={isConnected ? 0.85 : 0.65}
                                            className="ideaPointCenter"
                                        />
                                    </>
                                ) : (
                                    /* Solid dot for parent/base project */
                                    <circle
                                        cx={cx}
                                        cy={cy}
                                        r={isConnected ? 8 : 7}
                                        fill={pointColor}
                                        fillOpacity={isConnected ? 0.95 : 0.75}
                                        className="ideaPointCircle"
                                    />
                                )}

                                {isConnected && (
                                    <circle
                                        cx={cx}
                                        cy={cy}
                                        r={8}
                                        fill="#5dc193"
                                        className="similarityRing"
                                        stroke="#fffff"
                                        strokeWidth={1}
                                        strokeOpacity={0.3 + (strength / 100) * 0.5}
                                    />
                                )}
                            </g>
                        );
                    })}

                    {/* Точка чорновика (мій ввід) — рендериться останньою, лягає зверху всіх */}
                    {myPoint && (
                        <g>
                            <circle
                                cx={xScale(myPoint.x)}
                                cy={yScale(myPoint.y)}
                                r={10}
                                className="myIdeaGlow"
                                fill="none"
                                stroke="#1594C7"
                                strokeWidth={1.5}
                            />
                            <circle
                                cx={xScale(myPoint.x)}
                                cy={yScale(myPoint.y)}
                                r={7}
                                fill="#28bc77"
                                stroke="#FFFFFF"
                                strokeWidth={1}
                                className="draftPoint"
                            />
                        </g>
                    )}

                </g>
            </svg>

            {hovered && hoverPos && (
                <div
                    className="ideaMapTooltip"
                    style={{ left: hoverPos.x + 14, top: hoverPos.y + 14 }}
                >
                    <div className="tooltipHeader">
                        <p className="tooltipTitle">{hovered.title}</p>
                        {hovered.category && (
                            <span
                                className="tooltipCategoryPill"
                                style={{
                                    backgroundColor: `${getCategoryColor(hovered.category)}20`,
                                    color: getCategoryColor(hovered.category),
                                    borderColor: `${getCategoryColor(hovered.category)}40`,
                                }}
                            >
                                {hovered.category}
                            </span>
                        )}
                    </div>
                    <p className="tooltipDesc">{hovered.description}</p>
                </div>
            )}
        </div>
    );
}

export default IdeaMap;