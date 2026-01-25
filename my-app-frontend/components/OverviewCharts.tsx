
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { AppTheme, Task } from '../types';
import { THEME_CONFIG } from '../constants';

interface OverviewChartsProps {
  theme: AppTheme;
  isDark: boolean;
  tasks: Task[];
}

const OverviewCharts: React.FC<OverviewChartsProps> = ({ theme, isDark, tasks = [] }) => {
  const config = THEME_CONFIG[theme];

  // Lógica para processar dados de tarefas para o Gráfico de Barras (Progresso Semanal)
  const barData = useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const today = new Date();
    const currentDayIndex = today.getDay();

    // Inicializa os dados da semana com zero
    const weeklyStats = days.map((name, index) => ({
      name,
      completed: 0,
      pending: 0,
      fullIndex: index
    }));

    tasks.forEach(task => {
      let taskDayIndex = -1;
      const dueDate = task.dueDate.toLowerCase().trim();

      if (dueDate === 'hoje') {
        taskDayIndex = currentDayIndex;
      } else if (dueDate === 'amanhã') {
        taskDayIndex = (currentDayIndex + 1) % 7;
      } else {
        // Tenta parsear data formato AAAA-MM-DD ou outros
        const parsedDate = new Date(task.dueDate);
        if (!isNaN(parsedDate.getTime())) {
          taskDayIndex = parsedDate.getDay();
        } else {
          // Fallback para nomes de dias se o usuário digitar "Segunda" etc
          if (dueDate.includes('seg')) taskDayIndex = 1;
          else if (dueDate.includes('ter')) taskDayIndex = 2;
          else if (dueDate.includes('qua')) taskDayIndex = 3;
          else if (dueDate.includes('qui')) taskDayIndex = 4;
          else if (dueDate.includes('sex')) taskDayIndex = 5;
          else if (dueDate.includes('sáb')) taskDayIndex = 6;
          else if (dueDate.includes('dom')) taskDayIndex = 0;
        }
      }

      if (taskDayIndex !== -1) {
        if (task.completed) {
          weeklyStats[taskDayIndex].completed += 1;
        } else {
          weeklyStats[taskDayIndex].pending += 1;
        }
      }
    });

    // Reordenar para começar pela segunda-feira (padrão Brasil)
    const mondayFirst = [...weeklyStats.slice(1), weeklyStats[0]];
    return mondayFirst;
  }, [tasks]);

  // Lógica para o Gráfico de Pizza (Distribuição de Status)
  const pieData = useMemo(() => {
    const total = tasks.length;
    if (total === 0) {
      return [
        { name: 'Finalizado', value: 0, color: '#10b981' },
        { name: 'Pendente', value: 1, color: isDark ? '#1e293b' : '#f1f5f9' },
        { name: 'Em andamento', value: 0, color: '#3b82f6' },
      ];
    }

    const completed = tasks.filter(t => t.completed).length;
    // Consideramos "Em andamento" tarefas pendentes com prioridade alta
    const inProgress = tasks.filter(t => !t.completed && t.priority === 'high').length;
    const pending = tasks.length - completed - inProgress;

    return [
      { name: 'Finalizado', value: completed, color: '#10b981' },
      { name: 'Pendente', value: pending, color: '#ef4444' },
      { name: 'Em andamento', value: inProgress, color: '#3b82f6' },
    ];
  }, [tasks, isDark]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-4 rounded-2xl border shadow-xl ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-100'}`}>
          <p className="font-bold mb-1">{label || 'Status'}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} className="text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill || p.payload.color }}></span>
              {p.name}: <span className="font-bold">{p.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* Gráfico de Barras: Progresso Semanal Real */}
      <div className="h-72">
        <p className="text-xs font-black text-slate-400 uppercase mb-6 tracking-widest">Progresso Semanal</p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
            <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 'bold'}} />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? '#1e293b' : '#f8fafc', radius: 8 }} />
            <Bar dataKey="completed" name="Concluídas" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
            <Bar dataKey="pending" name="Pendentes" fill={isDark ? '#3b82f6' : '#60a5fa'} radius={[6, 6, 0, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Pizza: Distribuição de Status Real */}
      <div className="h-72 flex flex-col items-center">
        <p className="text-xs font-black text-slate-400 uppercase mb-6 tracking-widest w-full">Distribuição de Status</p>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              innerRadius={65}
              outerRadius={95}
              paddingAngle={8}
              dataKey="value"
              stroke="none"
              animationDuration={1000}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap justify-center gap-6 mt-4">
          {pieData.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
              <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewCharts;
