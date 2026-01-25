import { useState, useCallback } from 'react';

/**
 * Hook para otimização de carregamento de imagens
 * Melhora o desempenho em dispositivos móveis
 */
export const useImageOptimization = () => {
  const [imageCache, setImageCache] = useState(new Map());

  /**
   * Função para carregar imagem com cache e otimizações
   * @param {string} src - URL da imagem
   * @param {Object} options - Opções de otimização
   * @returns {Promise<string>} - URL otimizada da imagem
   */
  const loadImage = useCallback((src, options = {}) => {
    return new Promise((resolve, reject) => {
      // Verificar se a imagem já está em cache
      if (imageCache.has(src)) {
        resolve(imageCache.get(src));
        return;
      }

      // Verificar se estamos em dispositivo móvel
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      
      // Para dispositivos móveis, adicionar parâmetros de otimização se for uma imagem do Supabase
      let optimizedSrc = src;
      if (isMobile && src.includes('supabase.co')) {
        // Adicionar parâmetros de otimização para Supabase
        const url = new URL(src);
        url.searchParams.set('quality', '80');
        url.searchParams.set('width', '400'); // Reduzir largura para mobile
        optimizedSrc = url.toString();
      }

      // Criar objeto de imagem para pré-carregamento
      const img = new Image();
      img.onload = () => {
        // Armazenar em cache
        imageCache.set(src, optimizedSrc);
        // Limitar tamanho do cache
        if (imageCache.size > 50) {
          const firstKey = imageCache.keys().next().value;
          imageCache.delete(firstKey);
        }
        resolve(optimizedSrc);
      };
      img.onerror = () => {
        // Em caso de erro, retornar a URL original
        resolve(src);
      };
      img.src = optimizedSrc;
    });
  }, [imageCache]);

  /**
   * Função para obter atributos de imagem otimizados
   * @param {string} src - URL da imagem
   * @returns {Object} - Atributos otimizados
   */
  const getImageAttributes = useCallback((src) => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    
    return {
      src,
      loading: 'lazy',
      decoding: 'async',
      ...(isMobile && {
        // Atributos adicionais para dispositivos móveis
        fetchpriority: 'low',
      }),
    };
  }, []);

  return {
    loadImage,
    getImageAttributes,
    clearCache: () => setImageCache(new Map()),
  };
};