import React from 'react';
import './PlayerLevel.css';

const PlayerLevel = ({ level = 1, currentXp = 0, nextLevelXp = 100 }) => {
    const progressPercent = Math.min((currentXp / nextLevelXp) * 100, 100);

    return (
        <div className="player-level-container">
            <div className="level-badge">
                <span className="level-label">NÍVEL</span>
                <span className="level-number">{level}</span>
            </div>

            <div className="xp-progress-container">
                <div className="xp-info">
                    <span className="xp-label">XP (Experiência)</span>
                    <span className="xp-values">{currentXp} / {nextLevelXp}</span>
                </div>
                <div className="progress-bar-bg">
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>
                <p className="xp-message">
                    Ganhe mais {nextLevelXp - currentXp} XP para subir de nível!
                </p>
            </div>
        </div>
    );
};

export default PlayerLevel;
