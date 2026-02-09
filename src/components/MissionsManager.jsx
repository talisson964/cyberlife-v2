import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './MissionsManager.css';

const MissionsManager = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMission, setEditingMission] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    xp_reward: 100,
    active: true
  });

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMissions(data || []);
    } catch (error) {
      console.error('Erro ao buscar missões:', error);
      alert('Erro ao carregar missões.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const missionData = {
        title: formData.title,
        description: formData.description,
        xp_reward: parseInt(formData.xp_reward),
        active: formData.active
      };

      if (editingMission) {
        const { error } = await supabase
          .from('missions')
          .update(missionData)
          .eq('id', editingMission.id);

        if (error) throw error;
        alert('Missão atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('missions')
          .insert([missionData]);

        if (error) throw error;
        alert('Missão criada com sucesso!');
      }

      setShowForm(false);
      setEditingMission(null);
      setFormData({ title: '', description: '', xp_reward: 100, active: true });
      fetchMissions();
    } catch (error) {
      console.error('Erro ao salvar missão:', error);
      alert('Erro ao salvar missão: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (mission) => {
    setEditingMission(mission);
    setFormData({
      title: mission.title,
      description: mission.description || '',
      xp_reward: mission.xp_reward,
      active: mission.active
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta missão?')) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('missions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchMissions();
    } catch (error) {
      console.error('Erro ao deletar missão:', error);
      alert('Erro ao deletar missão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="missions-manager-container">
      <div className="missions-header">
        <h2>🎯 Gerenciar Missões</h2>
        <button 
          className="btn-add-mission"
          onClick={() => {
            setEditingMission(null);
            setFormData({ title: '', description: '', xp_reward: 100, active: true });
            setShowForm(true);
          }}
        >
          + Nova Missão
        </button>
      </div>

      {loading && <div className="loading-spinner">Carregando...</div>}

      {!loading && !showForm && (
        <div className="missions-list">
          {missions.length === 0 ? (
            <p className="no-missions">Nenhuma missão cadastrada.</p>
          ) : (
            <table className="missions-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>XP</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {missions.map((mission) => (
                  <tr key={mission.id}>
                    <td>
                      <div className="mission-title-cell">
                        <strong>{mission.title}</strong>
                        <small>{mission.description}</small>
                      </div>
                    </td>
                    <td><span className="xp-badge">+{mission.xp_reward} XP</span></td>
                    <td>
                      <span className={`status-badge ${mission.active ? 'active' : 'inactive'}`}>
                        {mission.active ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td>
                      <button className="btn-edit" onClick={() => handleEdit(mission)}>✏️</button>
                      <button className="btn-delete" onClick={() => handleDelete(mission.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showForm && (
        <div className="mission-form-overlay">
          <div className="mission-form-container">
            <h3>{editingMission ? 'Editar Missão' : 'Nova Missão'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Título da Missão</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Ex: Primeira Compra"
                />
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Detalhes sobre como completar a missão..."
                />
              </div>

              <div className="form-group">
                <label>Recompensa (XP)</label>
                <input
                  type="number"
                  name="xp_reward"
                  value={formData.xp_reward}
                  onChange={handleInputChange}
                  required
                  min="1"
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                  />
                  Missão Ativa
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn-save">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionsManager;
