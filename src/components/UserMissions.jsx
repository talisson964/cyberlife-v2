import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './UserMissions.css';

const UserMissions = ({ userId }) => {
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState(null);

    useEffect(() => {
        if (userId) {
            loadMissions();
        }
    }, [userId]);

    const loadMissions = async () => {
        try {
            setLoading(true);

            // 1. Carregar missões ativas
            const { data: allMissions, error: missionsError } = await supabase
                .from('missions')
                .select('*')
                .eq('active', true)
                .order('xp_reward', { ascending: true }); // Mais fáceis primeiro

            if (missionsError) throw missionsError;

            // 2. Carregar missões já completadas pelo usuário
            const { data: userMissions, error: userError } = await supabase
                .from('user_missions')
                .select('mission_id')
                .eq('user_id', userId);

            if (userError) throw userError;

            const completedMissionIds = new Set(userMissions.map(um => um.mission_id));

            // 3. Mesclar e marcar status
            // A duplicidade é impedida no banco (CONSTRAINT UNIQUE) e na função RPC (complete_mission)
            const missionsWithStatus = allMissions.map(m => ({
                ...m,
                completed: completedMissionIds.has(m.id)
            }));

            // Ordenar: Pendentes primeiro, Completadas depois
            missionsWithStatus.sort((a, b) => {
                if (a.completed === b.completed) return 0;
                return a.completed ? 1 : -1;
            });

            setMissions(missionsWithStatus);
        } catch (error) {
            console.error('Erro ao carregar missões:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClaimReward = async (mission) => {
        if (claiming) return;

        try {
            setClaiming(mission.id);

            // Chamar função RPC para completar missão de forma atômica
            const { data, error } = await supabase
                .rpc('complete_mission', {
                    mission_id_param: mission.id,
                    user_id_param: userId
                });

            if (error) throw error;

            if (data.success) {
                // Atualizar lista localmente
                setMissions(prev => prev.map(m =>
                    m.id === mission.id ? { ...m, completed: true } : m
                ));

                // Disparar efeito visual/sonoro de sucesso (simples alert por enquanto)
                alert(`🎉 Parabéns! Você completou a missão "${mission.title}" e ganhou +${data.xp_gained} XP!`);
            } else {
                alert(`Erro: ${data.message}`);
            }

        } catch (error) {
            console.error('Erro ao reivindicar recompensa:', error);
            alert('Erro ao processar recompensa.');
        } finally {
            setClaiming(null);
        }
    };

    if (loading) return <div className="missions-loading">Carregando missões...</div>;

    return (
        <div className="user-missions-container">
            <h3 className="section-title">🚀 Missões Disponíveis</h3>

            {missions.length === 0 ? (
                <p className="no-missions-msg">Nenhuma missão ativa no momento. Volte mais tarde, CyberRunner!</p>
            ) : (
                <div className="missions-grid">
                    {missions.map(mission => (
                        <div
                            key={mission.id}
                            className={`mission-card ${mission.completed ? 'completed' : 'pending'}`}
                        >
                            <div className="mission-content">
                                <div className="mission-header">
                                    <h4>{mission.title}</h4>
                                    <span className="xp-tag">+{mission.xp_reward} XP</span>
                                </div>
                                <p className="mission-desc">{mission.description}</p>
                                {mission.completed && (
                                    <div className="mission-status-badge">✅ CONCLUÍDA</div>
                                )}
                            </div>

                            <div className="mission-action">
                                {!mission.completed ? (
                                    <button
                                        className="btn-claim-reward"
                                        onClick={() => handleClaimReward(mission)}
                                        disabled={claiming === mission.id}
                                    >
                                        {claiming === mission.id ? 'Verificando...' : 'Reivindicar XP'}
                                    </button>
                                ) : (
                                    <button className="btn-completed" disabled>
                                        Completado
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserMissions;
