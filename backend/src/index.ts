import express from 'express';

const app = express();
const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535');
}
app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

// Demonstration records, not the official university timetable.
const lessons = [
  { id: 'demo-1', group: 'ПМК-13', subject: 'Програмування', teacher: 'Демонстраційний викладач', room: '215', floor: 2, startTime: '08:30', endTime: '09:50' },
  { id: 'demo-2', group: 'ПМК-13', subject: 'Математичний аналіз', teacher: 'Демонстраційний викладач', room: '308', floor: 3, startTime: '10:10', endTime: '11:30' },
];

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'lnu-map-api' });
});
app.get('/api/groups', (_req, res) => {
  res.json([{ id: 'pmk-13', name: 'ПМК-13' }]);
});
app.get('/api/schedule', (req, res) => {
  const group = req.query.group;
  if (typeof group !== 'string' || group.trim().length === 0 || group.length > 100) {
    res.status(400).json({ error: 'Потрібен параметр group, наприклад ПМК-13' });
    return;
  }
  res.json(lessons.filter((lesson) => lesson.group === group.trim()));
});
app.use((_req, res) => {
  res.status(404).json({ error: 'Маршрут не знайдено' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`LNU Map API listening on port ${port}`);
});
