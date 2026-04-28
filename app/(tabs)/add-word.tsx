import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { refreshNotifications } from './notifications';

export default function AddWordScreen() {
  const params = useLocalSearchParams();
  const langId = (params.langId as string) || 'en';
  const isEditing = !!params.editId;

  const [kelime, setKelime] = useState((params.kelime as string) || '');
  const [anlam, setAnlam] = useState((params.anlam as string) || '');
  const [zorluk, setZorluk] = useState((params.zorluk as string) || 'Kolay');

  const zorlukSeviyeleri = ['Kolay', 'Orta', 'Zor'];

  const handleSave = async () => {
    if (!kelime.trim() || !anlam.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen kelime ve anlamını doldurun.');
      return;
    }

    try {
      const storedWords = await AsyncStorage.getItem('@echoword_data');
      let parsedWords = storedWords ? JSON.parse(storedWords) : [];

      if (isEditing) {
        const wordIndex = parsedWords.findIndex((w: any) => w.id === params.editId);
        if (wordIndex > -1) {
          parsedWords[wordIndex] = { ...parsedWords[wordIndex], kelime, anlam, zorluk };
        }
      } else {
        const newWord = {
          id: Math.random().toString(36).substring(2, 11),
          langId: langId,
          kelime: kelime,
          anlam: anlam,
          zorluk: zorluk,
          createdAt: Date.now()
        };
        parsedWords.push(newWord);
      }

      await AsyncStorage.setItem('@echoword_data', JSON.stringify(parsedWords));

      
      router.back();

      setTimeout(() => {
        refreshNotifications().catch(err => console.log("Bildirim hatası:", err));
      }, 500);

    } catch (error) {
      Alert.alert('Hata', 'Kelime kaydedilirken bir sorun oluştu.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={30} color="#081a27" />
        </Pressable>
        <Text style={styles.headerTitle}>{isEditing ? 'Kelime Düzenle' : 'Kelime Ekle'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.scrollContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kelime</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: Serendipity"
                placeholderTextColor="#cbd5e1"
                value={kelime}
                onChangeText={setKelime}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Anlamı</Text>
              <TextInput
                style={styles.input}
                placeholder="Anlamını buraya yazın"
                placeholderTextColor="#cbd5e1"
                value={anlam}
                onChangeText={setAnlam}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Zorluk Seviyesi</Text>
              <View style={styles.segmentedControl}>
                {zorlukSeviyeleri.map((seviye) => (
                  <Pressable
                    key={seviye}
                    style={[
                      styles.segmentButton,
                      zorluk === seviye && styles.segmentButtonActive
                    ]}
                    onPress={() => setZorluk(seviye)}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        zorluk === seviye && styles.segmentTextActive
                      ]}
                    >
                      {seviye}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {!isEditing && (
              <View style={styles.quoteContainer}>
                <Text style={styles.quoteText}>
                  “Her yeni kelime, zihninde açılan yeni bir kapıdır.”
                </Text>
              </View>
            )}
          </View>

          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <View style={styles.footer}>
              <Pressable 
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>{isEditing ? 'Güncelle' : 'Kaydet'}</Text>
              </Pressable>
              <Text style={styles.footerBrandText}>E C H O W O R D</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    height: 60
  },
  backButton: {
    padding: 5
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#081a27'
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingTop: 30
  },
  inputGroup: {
    marginBottom: 30
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#081a27',
    marginBottom: 12
  },
  input: {
    height: 55,
    borderWidth: 1,
    borderColor: '#e0effb',
    borderRadius: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#081a27',
    backgroundColor: '#fff'
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0effb',
    borderRadius: 15,
    height: 55,
    padding: 5
  },
  segmentButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12
  },
  segmentButtonActive: {
    backgroundColor: '#309ce8'
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b'
  },
  segmentTextActive: {
    color: '#fff'
  },
  quoteContainer: {
    marginTop: 40,
    alignItems: 'center',
    paddingHorizontal: 20
  },
  quoteText: {
    fontSize: 16,
    color: '#94a3b8',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24
  },
  footer: {
    paddingHorizontal: 25,
    paddingBottom: 20,
    alignItems: 'center'
  },
  saveButton: {
    backgroundColor: '#309ce8',
    width: '100%',
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  footerBrandText: {
    fontSize: 10,
    color: '#cbd5e1',
    letterSpacing: 5,
    fontWeight: '400'
  }
});