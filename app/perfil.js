import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import AnimatedScreen from '../components/AnimatedScreen';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import KeyboardAwareScreen from '../components/KeyboardAwareScreen';
import Toast from '../components/Toast';
import { spacing, typography, radius } from '../constants/theme';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { validateEmail, validateName } from '../utils/validators';

const reminderOptions = ['15 min', '30 min', '1 hora'];
const studySlots = ['Manha', 'Tarde', 'Noite'];

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, updateProfile } = useAuth();
  const { reservas, itens, tasks, tickets, favoriteRooms, preferences, updatePreferences } = useAppData();
  const [form, setForm] = useState({
    name: '',
    email: '',
    course: '',
    semester: '',
    campus: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const courseRef = useRef(null);
  const campusRef = useRef(null);
  const semesterRef = useRef(null);
  const bioRef = useRef(null);

  useEffect(() => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      course: user?.course || '',
      semester: user?.semester || '',
      campus: user?.campus || '',
      bio: user?.bio || '',
    });
  }, [user]);

  function handleChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSave() {
    if (!validateName(form.name)) {
      setToast({ visible: true, message: 'Informe um nome valido para o perfil.', type: 'warning' });
      return;
    }

    if (form.email && !validateEmail(form.email)) {
      setToast({ visible: true, message: 'Informe um email valido ou deixe em branco.', type: 'warning' });
      return;
    }

    try {
      setLoading(true);
      await updateProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        course: form.course.trim(),
        semester: form.semester.trim(),
        campus: form.campus.trim(),
        bio: form.bio.trim(),
      });
      setToast({ visible: true, message: 'Perfil atualizado com sucesso.', type: 'success' });
    } catch (error) {
      setToast({ visible: true, message: 'Nao foi possivel salvar o perfil.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleTogglePreference(field, value) {
    try {
      await updatePreferences({ [field]: value });
    } catch (error) {
      setToast({ visible: true, message: 'Nao foi possivel atualizar a preferencia.', type: 'error' });
    }
  }

  return (
    <AnimatedScreen>
      <KeyboardAwareScreen backgroundColor={colors.background} contentContainerStyle={styles.content}>
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={() => setToast((current) => ({ ...current, visible: false }))}
        />

        <View style={[styles.heroCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>Perfil do aluno</Text>
          <Text style={[styles.title, { color: colors.text }]}>{user?.name || 'Aluno FIAP'}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            RM {user?.rm} - personalize sua experiencia e centralize suas preferencias academicas.
          </Text>

          <View style={styles.metricsGrid}>
            <MetricCard label="Reservas" value={String(reservas.length)} colors={colors} />
            <MetricCard label="Itens" value={String(itens.length)} colors={colors} />
            <MetricCard label="Tarefas" value={String(tasks.length)} colors={colors} />
            <MetricCard label="Favoritas" value={String(favoriteRooms.length)} colors={colors} />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Dados principais</Text>
          <CustomInput
            label="Nome"
            value={form.name}
            onChangeText={(value) => handleChange('name', value)}
            placeholder="Seu nome completo"
            icon="person-outline"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => courseRef.current?.focus()}
          />
          <CustomInput
            label="Email"
            value={form.email}
            onChangeText={(value) => handleChange('email', value)}
            placeholder="nome@fiap.com.br"
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <CustomInput
            ref={courseRef}
            label="Curso"
            value={form.course}
            onChangeText={(value) => handleChange('course', value)}
            placeholder="Ex.: Engenharia de Software"
            icon="school-outline"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => campusRef.current?.focus()}
          />
          <CustomInput
            ref={campusRef}
            label="Campus"
            value={form.campus}
            onChangeText={(value) => handleChange('campus', value)}
            placeholder="Ex.: Paulista"
            icon="location-outline"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => semesterRef.current?.focus()}
          />
          <CustomInput
            ref={semesterRef}
            label="Semestre"
            value={form.semester}
            onChangeText={(value) => handleChange('semester', value)}
            placeholder="Ex.: 3o semestre"
            icon="layers-outline"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => bioRef.current?.focus()}
          />
          <CustomInput
            ref={bioRef}
            label="Bio"
            value={form.bio}
            onChangeText={(value) => handleChange('bio', value)}
            placeholder="Conte em poucas linhas o seu foco atual"
            icon="sparkles-outline"
            multiline
            numberOfLines={4}
          />

          <CustomButton title="Salvar perfil" onPress={handleSave} loading={loading} />
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferencias da experiencia</Text>

          <View style={[styles.preferenceRow, { borderBottomColor: colors.border }]}>
            <View style={styles.preferenceBody}>
              <Text style={[styles.preferenceTitle, { color: colors.text }]}>Quick check-in</Text>
              <Text style={[styles.preferenceText, { color: colors.textSecondary }]}>
                Destaque rapido para acessos importantes na home.
              </Text>
            </View>
            <Switch
              value={preferences.quickCheckin}
              onValueChange={(value) => handleTogglePreference('quickCheckin', value)}
              thumbColor="#FFFFFF"
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <View style={styles.preferenceRow}>
            <View style={styles.preferenceBody}>
              <Text style={[styles.preferenceTitle, { color: colors.text }]}>Modo foco</Text>
              <Text style={[styles.preferenceText, { color: colors.textSecondary }]}>
                Priorizacao de estudo e entregas no dashboard.
              </Text>
            </View>
            <Switch
              value={preferences.focusMode}
              onValueChange={(value) => handleTogglePreference('focusMode', value)}
              thumbColor="#FFFFFF"
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Janela de lembrete</Text>
          <View style={styles.chipsRow}>
            {reminderOptions.map((item) => {
              const selected = preferences.reminderWindow === item;
              return (
                <TouchablePreferenceChip
                  key={item}
                  label={item}
                  selected={selected}
                  colors={colors}
                  onPress={() => handleTogglePreference('reminderWindow', item)}
                />
              );
            })}
          </View>

          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Bloco preferido de estudo</Text>
          <View style={styles.chipsRow}>
            {studySlots.map((item) => {
              const selected = preferences.preferredStudySlot === item;
              return (
                <TouchablePreferenceChip
                  key={item}
                  label={item}
                  selected={selected}
                  colors={colors}
                  onPress={() => handleTogglePreference('preferredStudySlot', item)}
                />
              );
            })}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Visao de produtividade</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            Chamados ativos: {tickets.filter((ticket) => ticket.status !== 'resolvido').length} | tarefas concluidas:{' '}
            {tasks.filter((task) => task.done).length}
          </Text>
        </View>
      </KeyboardAwareScreen>
    </AnimatedScreen>
  );
}

function TouchablePreferenceChip({ label, selected, colors, onPress }) {
  return (
    <TouchableOpacity
      style={[
        styles.preferenceChip,
        {
          backgroundColor: selected ? colors.primary : colors.inputBg,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.preferenceChipText, { color: selected ? '#FFFFFF' : colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function MetricCard({ label, value, colors }) {
  return (
    <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  title: {
    ...typography.h1,
    marginTop: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  metricCard: {
    width: '47%',
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  metricLabel: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: spacing.md,
  },
  sectionText: {
    ...typography.body,
    lineHeight: 22,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  preferenceBody: {
    flex: 1,
    gap: spacing.xs,
  },
  preferenceTitle: {
    ...typography.h4,
  },
  preferenceText: {
    ...typography.caption,
    lineHeight: 18,
  },
  fieldLabel: {
    ...typography.caption,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  preferenceChip: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  preferenceChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
