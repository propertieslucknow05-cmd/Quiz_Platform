import { Team, MediaItem, AnswerSubmission } from '@/types/quiz';

export function exportScoresToCSV(teams: Team[]) {
  const headers = ['Rank', 'Team Name', 'Total Score', 'Correct Answers', 'Wrong Answers', 'Accuracy (%)', 'Avg Response Time (s)', 'Streak'];
  
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  const rows = sortedTeams.map((team, idx) => {
    const totalAnswered = team.correctAnswers + team.wrongAnswers;
    const accuracy = totalAnswered > 0 ? ((team.correctAnswers / totalAnswered) * 100).toFixed(1) : '0';
    const avgTime = totalAnswered > 0 ? (team.totalTimeMs / totalAnswered / 1000).toFixed(2) : '0';

    return [
      idx + 1,
      `"${team.name.replace(/"/g, '""')}"`,
      team.score,
      team.correctAnswers,
      team.wrongAnswers,
      `${accuracy}%`,
      `${avgTime}s`,
      team.streak
    ];
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `ai_vs_human_quiz_leaderboard_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generatePrintableReport(
  quizTitle: string,
  teams: Team[],
  mediaList: MediaItem[],
  submissions: Record<number, Record<string, AnswerSubmission>>
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>AI vs Human Quiz - Final Report</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
          h1 { color: #0284c7; font-size: 28px; margin-bottom: 5px; }
          .sub { color: #64748b; font-size: 14px; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th, td { border: 1px solid #cbd5e1; padding: 12px 16px; text-align: left; }
          th { background: #f1f5f9; font-weight: 600; }
          tr:nth-child(even) { background: #f8fafc; }
          .badge-ai { background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; }
          .badge-human { background: #dcfce7; color: #15803d; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; }
          .podium { display: flex; gap: 20px; margin-bottom: 30px; }
          .card { flex: 1; padding: 20px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; text-align: center; }
          .rank-1 { border-color: #eab308; background: #fefce8; }
          .rank-2 { border-color: #94a3b8; background: #f8fafc; }
          .rank-3 { border-color: #b45309; background: #fff7ed; }
        </style>
      </head>
      <body>
        <h1>🏆 ${quizTitle}</h1>
        <p class="sub">Generated on ${new Date().toLocaleString()} • Live Competition Summary</p>

        <h2>Leaderboard Standings</h2>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Team Name</th>
              <th>Score</th>
              <th>Correct</th>
              <th>Wrong</th>
              <th>Accuracy</th>
              <th>Avg Response Time</th>
            </tr>
          </thead>
          <tbody>
            ${sortedTeams.map((t, idx) => {
              const total = t.correctAnswers + t.wrongAnswers;
              const acc = total > 0 ? ((t.correctAnswers / total) * 100).toFixed(1) : '0';
              const avgT = total > 0 ? (t.totalTimeMs / total / 1000).toFixed(2) : '0';
              return `
                <tr>
                  <td><strong>#${idx + 1}</strong></td>
                  <td>${t.avatar} ${t.name}</td>
                  <td><strong>${t.score} pts</strong></td>
                  <td style="color: #16a34a;">${t.correctAnswers}</td>
                  <td style="color: #dc2626;">${t.wrongAnswers}</td>
                  <td>${acc}%</td>
                  <td>${avgT}s</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <h2>Question Performance Summary</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Media Title</th>
              <th>Type</th>
              <th>Actual Source</th>
              <th>Attribution</th>
            </tr>
          </thead>
          <tbody>
            ${mediaList.map((m, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>${m.title}</td>
                <td>${m.type}</td>
                <td>
                  <span class="${m.source === 'AI' ? 'badge-ai' : 'badge-human'}">
                    ${m.source}
                  </span>
                </td>
                <td>${m.attribution}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
