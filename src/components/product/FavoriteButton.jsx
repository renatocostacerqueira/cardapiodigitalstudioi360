import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Botão de favoritar um produto. Sincroniza com a entidade Favorite.
 * Props:
 *  - productId
 *  - size: tamanho do ícone
 *  - className / style: customização
 *  - darkBg: se true, botão adequado para overlay em imagens (fundo translúcido escuro)
 */
export default function FavoriteButton({ productId, size = 18, darkBg = false, style }) {
  const [liked, setLiked] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;
    async function fetchStatus() {
      const favs = await base44.entities.Favorite.filter({ product_id: productId });
      if (cancelled) return;
      if (favs.length > 0) {
        setLiked(true);
        setFavoriteId(favs[0].id);
      } else {
        setLiked(false);
        setFavoriteId(null);
      }
      setLoading(false);
    }
    fetchStatus();
    return () => { cancelled = true; };
  }, [productId]);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    if (liked && favoriteId) {
      setLiked(false);
      setFavoriteId(null);
      await base44.entities.Favorite.delete(favoriteId);
    } else {
      setLiked(true);
      const created = await base44.entities.Favorite.create({ product_id: productId });
      setFavoriteId(created.id);
    }
    queryClient.invalidateQueries({ queryKey: ['favorites'] });
  };

  return (
    <button
      onClick={handleClick}
      aria-label={liked ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      style={{
        width: 40, height: 40, borderRadius: 'var(--r-sm)',
        background: darkBg ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(8px)',
        border: 'none', cursor: 'pointer', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        boxShadow: darkBg ? 'none' : 'var(--shadow-sm)',
        transition: 'transform 0.15s',
        ...style,
      }}
    >
      <Heart style={{
        width: size, height: size,
        color: liked ? '#ef4444' : (darkBg ? '#fff' : 'var(--gray-500)'),
        fill: liked ? '#ef4444' : 'transparent',
        transition: 'color 0.2s, fill 0.2s',
      }} />
    </button>
  );
}