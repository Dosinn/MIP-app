import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './IdeaRadar.css';

export interface RadarData {
    problemFocus: number;
    nichePrecision: number;
    alignment: number;
    uniqueness: number;
    evidence: number;
}

interface IdeaRadarProps {
    current: RadarData;
    baseline?: RadarData | null;
    currentLabel?: string;
    baselineLabel?: string;
}

export const IdeaRadar: React.FC<IdeaRadarProps> = ({
    current,
    baseline,
    currentLabel,
    baselineLabel,
}) => {
    const { t } = useTranslation();

    const radarAxes = useMemo(() => [
        { key: 'problemFocus', label: t('radar_problem_focus') },
        { key: 'nichePrecision', label: t('radar_niche_precision') },
        { key: 'alignment', label: t('radar_alignment') },
        { key: 'uniqueness', label: t('radar_uniqueness') },
        { key: 'evidence', label: t('radar_evidence') },
    ] as const, [t]);

    const viewBoxWidth = 320;
    const viewBoxHeight = 320;
    const centerX = 160;
    const centerY = 175;
    const radius = 140;

    const numAxes = radarAxes.length;
    const angleSlice = (Math.PI * 2) / numAxes;
    const levels = [0.25, 0.5, 0.75, 1];

    const getCoordinates = (val: number, index: number) => {
        const r = radius * (Math.max(10, Math.min(100, val)) / 100);
        const angle = index * angleSlice - Math.PI / 2;
        return {
            x: centerX + r * Math.cos(angle),
            y: centerY + r * Math.sin(angle),
        };
    };

    const currentPoints = useMemo(() => {
        return radarAxes.map((axis, i) => {
            const val = current[axis.key as keyof RadarData] ?? 50;
            const { x, y } = getCoordinates(val, i);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        }).join(' ');
    }, [current, radarAxes]);

    const baselinePoints = useMemo(() => {
        if (!baseline) return null;
        return radarAxes.map((axis, i) => {
            const val = baseline[axis.key as keyof RadarData] ?? 50;
            const { x, y } = getCoordinates(val, i);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        }).join(' ');
    }, [baseline, radarAxes]);

    // Overall Maturity Score (Weighted)
    const overallScore = Math.round(
        current.problemFocus * 0.25 +
        current.nichePrecision * 0.25 +
        current.alignment * 0.20 +
        current.uniqueness * 0.20 +
        current.evidence * 0.10
    );

    const getScoreStatus = (score: number) => {
        if (score >= 70) return { text: t('maturity_ready'), class: 'maturity--high' };
        if (score >= 50) return { text: t('maturity_improve'), class: 'maturity--med' };
        return { text: t('maturity_need_work'), class: 'maturity--low' };
    };

    const status = getScoreStatus(overallScore);
    // const StatusIcon = status.icon;

    return (
        <div className="ideaRadarBox">
            {/* Overall Score Header */}
            <div className="radarMaturityHeader">
                <div className="maturityScoreLeft">
                    <span className="maturityScoreNumber">{overallScore}%</span>
                    <div className="maturityScoreDetails">
                        <span className="maturityLabel">{t('idea_maturity_score')}</span>
                        <span className={`maturityStatusText ${status.class}`}>
                            {status.text}
                        </span>
                    </div>
                </div>
            </div>

            <div className="radarSvgWrapper">
                <svg
                    viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                    className="radarSvg"
                >
                    {/* Background spider grid */}
                    {levels.map((level) => (
                        <polygon
                            key={level}
                            className="radarGridPolygon"
                            points={radarAxes.map((_, i) => {
                                const r = radius * level;
                                const angle = i * angleSlice - Math.PI / 2;
                                return `${(centerX + r * Math.cos(angle)).toFixed(1)},${(centerY + r * Math.sin(angle)).toFixed(1)}`;
                            }).join(' ')}
                        />
                    ))}

                    {/* Radiating axis lines */}
                    {radarAxes.map((_, i) => {
                        const angle = i * angleSlice - Math.PI / 2;
                        return (
                            <line
                                key={i}
                                x1={centerX}
                                y1={centerY}
                                x2={centerX + radius * Math.cos(angle)}
                                y2={centerY + radius * Math.sin(angle)}
                                className="radarAxis"
                            />
                        );
                    })}

                    {/* Baseline polygon (if improving) */}
                    {baselinePoints && (
                        <polygon points={baselinePoints} className="radarBaselinePoly" />
                    )}

                    {/* Current draft polygon */}
                    <polygon points={currentPoints} className="radarCurrentPoly" />

                    {/* Dots on vertices */}
                    {radarAxes.map((axis, i) => {
                        const val = current[axis.key as keyof RadarData] ?? 50;
                        const { x, y } = getCoordinates(val, i);
                        return (
                            <circle
                                key={axis.key}
                                cx={x}
                                cy={y}
                                r={4.5}
                                className="radarDot"
                            />
                        );
                    })}

                    {/* Axis Labels placed precisely around large web */}
                    {radarAxes.map((axis, i) => {
                        const val = current[axis.key as keyof RadarData] ?? 50;

                        let lx = 0;
                        let ly = 0;
                        let textAnchor: 'middle' | 'start' | 'end' = 'middle';

                        if (i === 0) {
                            // Top (Problem Focus)
                            lx = centerX;
                            ly = 12;
                            textAnchor = 'middle';
                        } else if (i === 1) {
                            // Top-Right (Targeting)
                            lx = 330;
                            ly = 110;
                            textAnchor = 'end';
                        } else if (i === 2) {
                            // Bottom-Right (Alignment)
                            lx = 260;
                            ly = 305;
                            textAnchor = 'middle';
                        } else if (i === 3) {
                            // Bottom-Left (Uniqueness)
                            lx = 58;
                            ly = 305;
                            textAnchor = 'middle';
                        } else if (i === 4) {
                            // Top-Left (Evidence)
                            lx = -5;
                            ly = 110;
                            textAnchor = 'start';
                        }

                        return (
                            <text
                                key={axis.key}
                                x={lx}
                                y={ly}
                                textAnchor={textAnchor}
                                className="radarLabel"
                            >
                                <tspan x={lx} dy="0" className="radarLabelText">{axis.label}</tspan>
                                <tspan x={lx} dy="12" className="radarLabelVal">({val}%)</tspan>
                            </text>
                        );
                    })}
                </svg>
            </div>

            {/* Mini Legend */}
            <div className="radarLegend">
                <div className="legendItem">
                    <span className="legendDot legendDot--current" />
                    <span className="legendName">{currentLabel || t('your_project_label')}</span>
                </div>
                {baseline && (
                    <div className="legendItem">
                        <span className="legendDot legendDot--baseline" />
                        <span className="legendName">{baselineLabel || t('baseline_project_label')}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IdeaRadar;
