import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type Lesson = {
  id: string; group: string; subject: string; teacher: string;
  room: string; floor: number; startTime: string; endTime: string;
};
const demoLessons: Lesson[] = [
  { id: 'demo-1', group: 'ПМК-13', subject: 'Програмування', teacher: 'Демонстраційний викладач', room: '215', floor: 2, startTime: '08:30', endTime: '09:50' },
  { id: 'demo-2', group: 'ПМК-13', subject: 'Математичний аналіз', teacher: 'Демонстраційний викладач', room: '308', floor: 3, startTime: '10:10', endTime: '11:30' },
];
const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '');

export default function App() {
  const [lessons, setLessons] = useState<Lesson[]>(apiUrl ? [] : demoLessons);
  const [loading, setLoading] = useState(Boolean(apiUrl));
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!apiUrl) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let active = true;
    setLoading(true);
    setError(null);
    fetch(`${apiUrl}/api/schedule?group=${encodeURIComponent('ПМК-13')}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data: unknown = await response.json();
        if (!Array.isArray(data) || !data.every((item) =>
          item && typeof item === 'object' &&
          ['id', 'group', 'subject', 'teacher', 'room', 'startTime', 'endTime'].every((key) => typeof item[key] === 'string') &&
          typeof item.floor === 'number'
        )) throw new Error('Некоректна відповідь API');
        if (active) setLessons(data as Lesson[]);
      })
      .catch(() => {
        if (active) setError('Не вдалося завантажити розклад. Перевір адресу API та підключення.');
      })
      .finally(() => {
        clearTimeout(timeout);
        if (active) setLoading(false);
      });
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [attempt]);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.brand}>LNU MAP</Text>
        <Text style={styles.heading}>Мій розклад</Text>
        <Text style={styles.group}>Група ПМК-13</Text>
        <Text style={styles.notice}>Демонстраційні дані · {apiUrl ? 'з API' : 'локальний перегляд'}</Text>
        {loading && <ActivityIndicator size="large" color="#276354" />}
        {error && <View style={styles.card}>
          <Text accessibilityRole="alert">{error}</Text>
          <Pressable style={styles.button} onPress={() => setAttempt((value) => value + 1)} accessibilityRole="button">
            <Text style={styles.buttonText}>Спробувати ще раз</Text>
          </Pressable>
        </View>}
        {!loading && !error && lessons.length === 0 && <Text>Для цієї групи пар поки немає.</Text>}
        {!loading && !error && lessons.map((lesson) => (
          <View key={lesson.id} style={styles.card}>
            <Text style={styles.time}>{lesson.startTime} — {lesson.endTime}</Text>
            <Text style={styles.subject}>{lesson.subject}</Text>
            <Text style={styles.detail}>{lesson.teacher}</Text>
            <Pressable style={styles.button} accessibilityRole="button" onPress={() =>
              Alert.alert(`Аудиторія ${lesson.room}`, `Поверх: ${lesson.floor}\nКарту корпусу додамо на наступному етапі.`)
            }>
              <Text style={styles.buttonText}>Аудиторія {lesson.room} · {lesson.floor} поверх</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F6F3' },
  content: { padding: 24, paddingTop: 64, paddingBottom: 40, gap: 16 },
  brand: { color: '#276354', fontWeight: '800', letterSpacing: 3, fontSize: 14 },
  heading: { color: '#18392F', fontSize: 32, fontWeight: '700' },
  group: { color: '#485F56', fontSize: 18 },
  notice: { color: '#66756D', fontSize: 13 },
  card: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 20, gap: 12 },
  time: { color: '#276354', fontWeight: '600' },
  subject: { fontSize: 21, fontWeight: '700', color: '#18392F' },
  detail: { color: '#66756D' },
  button: { backgroundColor: '#E7F1EB', borderRadius: 12, padding: 14 },
  buttonText: { color: '#20533F', fontWeight: '600' },
});
