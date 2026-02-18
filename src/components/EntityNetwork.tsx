/**
 * EntityNetwork - Visualização de rede de relacionamentos
 * Mostra entidades como nós conectados por linhas representando força de conexão
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface NetNode {
  id: string;
  name: string;
  type: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

interface NetConnection {
  source: string;
  target: string;
  strength: number;
}

interface NetworkData {
  nodes: NetNode[];
  connections: NetConnection[];
}

const TYPE_COLORS: Record<string, string> = {
  PERSON: '#3b82f6',
  HABIT: '#10b981',
  PROJECT: '#f97316',
  GOAL: '#8b5cf6',
  DREAM: '#ec4899',
  EVENT: '#f59e0b',
  CUSTOM: '#64748b',
};

export function EntityNetwork() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [network, setNetwork] = useState<NetworkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    loadNetwork();
  }, [id]);

  const loadNetwork = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        id ? `/api/entities/${id}/network` : `/api/metrics/network`
      );
      
      const nodes = data.nodes.map((node, idx) => ({
        ...node,
        x: Math.cos((idx / data.nodes.length) * Math.PI * 2) * 200,
        y: Math.sin((idx / data.nodes.length) * Math.PI * 2) * 200,
        vx: 0,
        vy: 0,
      }));

      setNetwork({ nodes, connections: data.connections });
      animate(nodes, data.connections);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar rede');
    } finally {
      setLoading(false);
    }
  };

  const animate = (nodes: NetNode[], connections: NetConnection[]) => {
    let animationId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const simulate = () => {
      for (let i = 0; i < nodes.length; i++) {
        let fx = 0;
        let fy = 0;

        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const dx = (nodes[j].x || 0) - (nodes[i].x || 0);
          const dy = (nodes[j].y || 0) - (nodes[i].y || 0);
          const dist = Math.hypot(dx, dy) || 1;
          const force = 300 / (dist * dist);
          fx -= (dx / dist) * force;
          fy -= (dy / dist) * force;
        }

        for (const conn of connections) {
          if (conn.source === nodes[i].id) {
            const target = nodes.find((n) => n.id === conn.target);
            if (target) {
              const dx = (target.x || 0) - (nodes[i].x || 0);
              const dy = (target.y || 0) - (nodes[i].y || 0);
              const dist = Math.hypot(dx, dy) || 1;
              const force = (conn.strength * 50) / dist;
              fx += (dx / dist) * force;
              fy += (dy / dist) * force;
            }
          } else if (conn.target === nodes[i].id) {
            const source = nodes.find((n) => n.id === conn.source);
            if (source) {
              const dx = (source.x || 0) - (nodes[i].x || 0);
              const dy = (source.y || 0) - (nodes[i].y || 0);
              const dist = Math.hypot(dx, dy) || 1;
              const force = (conn.strength * 50) / dist;
              fx += (dx / dist) * force;
              fy += (dy / dist) * force;
            }
          }
        }

        nodes[i].vx = (((nodes[i].vx ?? 0) + fx * 0.005) * 0.99);
        nodes[i].vy = (((nodes[i].vy ?? 0) + fy * 0.005) * 0.99);
        nodes[i].x = (nodes[i].x ?? 0) + (nodes[i].vx ?? 0);
        nodes[i].y = (nodes[i].y ?? 0) + (nodes[i].vy ?? 0);
      }

      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
      ctx.scale(zoom, zoom);

      for (const conn of connections) {
        const source = nodes.find((n) => n.id === conn.source);
        const target = nodes.find((n) => n.id === conn.target);
        if (!source || !target) continue;

        ctx.strokeStyle = `rgba(100, 116, 139, ${conn.strength * 0.5})`;
        ctx.lineWidth = conn.strength * 3;
        ctx.beginPath();
        ctx.moveTo(source.x || 0, source.y || 0);
        ctx.lineTo(target.x || 0, target.y || 0);
        ctx.stroke();
      }

      for (const node of nodes) {
        const radius = hoveredNode === node.id ? 8 : 6;
        ctx.fillStyle = TYPE_COLORS[node.type] || '#64748b';
        ctx.beginPath();
        ctx.arc(node.x || 0, node.y || 0, radius, 0, Math.PI * 2);
        ctx.fill();

        if (hoveredNode === node.id) {
          ctx.fillStyle = '#fff';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(node.name, (node.x || 0), (node.y || 0) + 15);
        }
      }

      ctx.restore();
      animationId = requestAnimationFrame(simulate);
    };

    simulate();
    return () => cancelAnimationFrame(animationId);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!network || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - canvas.width / 2 - offsetX) / zoom;
    const y = (e.clientY - rect.top - canvas.height / 2 - offsetY) / zoom;

    for (const node of network.nodes) {
      const dx = (node.x || 0) - x;
      const dy = (node.y || 0) - y;
      if (Math.hypot(dx, dy) < 8) {
        navigate(`/entities/${node.id}`);
        return;
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!network || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - canvas.width / 2 - offsetX) / zoom;
    const y = (e.clientY - rect.top - canvas.height / 2 - offsetY) / zoom;

    for (const node of network.nodes) {
      const dx = (node.x || 0) - x;
      const dy = (node.y || 0) - y;
      if (Math.hypot(dx, dy) < 8) {
        setHoveredNode(node.id);
        return;
      }
    }
    setHoveredNode(null);
  };

  if (loading) return <Skeleton className="h-96 rounded-lg" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">🌐 Rede de Entidades</h2>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom((z) => Math.min(z + 0.1, 3))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom((z) => Math.max(z - 0.1, 0.5))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setZoom(1);
              setOffsetX(0);
              setOffsetY(0);
            }}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={() => setHoveredNode(null)}
        className="w-full border border-border rounded-lg bg-background cursor-grab active:cursor-grabbing"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-muted-foreground">{type.toLowerCase()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}