import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#309ce8',
  bgLight: '#f8fafc',
  textDark: '#0f172a',
  textGray: '#64748b',
  white: '#ffffff',
  border: '#f1f5f9',
  infoBg: '#eff6ff',
};

// --- KENDİ ÖZEL SWITCH BİLEŞENİMİZ ---
const CustomSwitch = ({ value, onValueChange }: { value: boolean, onValueChange: () => void }) => {
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 250,
      useNativeDriver: false, 
    }).start();
  }, [value]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22] 
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e2e8f0', COLORS.primary]
  });

  return (
    <Pressable onPress={onValueChange} hitSlop={10}>
      <Animated.View style={[styles.customSwitchContainer, { backgroundColor }]}>
        <Animated.View style={[styles.customSwitchThumb, { transform: [{ translateX }] }]} />
      </Animated.View>
    </Pressable>
  );
};

// --- KENDİ ÖZEL (KALIN VE MODERN) SLIDER BİLEŞENİMİZ ---
const CustomSlider = ({ value, onValueChange }: { value: number, onValueChange: (val: number) => void }) => {
  const [sliderWidth, setSliderWidth] = useState(0);
  const thumbSize = 28;
  const min = 1;
  const max = 12;

  const onValueChangeRef = useRef(onValueChange);
  onValueChangeRef.current = onValueChange;
  const widthRef = useRef(sliderWidth);
  widthRef.current = sliderWidth;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => updateValue(evt.nativeEvent.locationX),
      onPanResponderMove: (evt) => updateValue(evt.nativeEvent.locationX),
    })
  ).current;

  const updateValue = (x: number) => {
    const w = widthRef.current;
    if (w === 0) return;
    
    let percentage = (x - thumbSize / 2) / (w - thumbSize);
    if (percentage < 0) percentage = 0;
    if (percentage > 1) percentage = 1;
    
    const newValue = Math.round(min + percentage * (max - min));
    onValueChangeRef.current(newValue);
  };

  const percentage = (value - min) / (max - min);
  const availableWidth = Math.max(0, sliderWidth - thumbSize);
  const thumbPosition = availableWidth * percentage;
  const fillWidth = thumbPosition + thumbSize / 2;

  return (
    <View 
      style={styles.customSliderWrap} 
      onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
    >
      <View style={styles.customSliderTrack} />
      <View style={[styles.customSliderFill, { width: fillWidth }]} />
      <View style={[styles.customSliderThumb, { left: thumbPosition }]} />
      <View {...panResponder.panHandlers} style={styles.customSliderTouchArea} />
    </View>
  );
};


export default function NotificationSettingsScreen() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [range, setRange] = useState(3);

  // EKRAN AÇILDIĞINDA KAYITLI AYARLARI GETİR
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedStatus = await AsyncStorage.getItem('@echoword_notif_status');
        const savedRange = await AsyncStorage.getItem('@echoword_notif_range');

        if (savedStatus !== null) {
          setIsEnabled(savedStatus === 'true');
        }
        if (savedRange !== null) {
          setRange(parseInt(savedRange, 10));
        }
      } catch (error) {
        console.error("Ayarlar yüklenirken hata:", error);
      }
    };
    loadSettings();
  }, []);

  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

  // AYARLARI KAYDET VE GERİ DÖN
  const handleSaveSettings = async () => {
    try {
      await AsyncStorage.setItem('@echoword_notif_status', isEnabled.toString());
      await AsyncStorage.setItem('@echoword_notif_range', range.toString());
      
      // Gelecekte buraya bildirim tetikleme/zamanlama kodunu ekleyebilirsin
      
      router.back();
    } catch (error) {
      console.error("Ayarlar kaydedilirken hata:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable 
          onPress={() => router.back()} 
          style={styles.backButton}
          hitSlop={20}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textDark} />
        </Pressable>
        <Text style={styles.headerTitle}>Bildirim Ayarları</Text>
        <Pressable hitSlop={20}>
          <MaterialCommunityIcons name="dots-vertical" size={24} color={COLORS.textGray} />
        </Pressable>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topIllustration}>
          <View style={styles.bellWrapper}>
            <MaterialCommunityIcons 
              name="bell" 
              size={40} 
              color={COLORS.primary} 
              style={styles.iconFix} 
            />
          </View>
          <Text style={styles.illustrationText}>
            Fısıltılarınızı kontrol edin ve gününüzü kelimelerle zenginleştirin.
          </Text>
        </View>

        <View style={styles.switchCard}>
          <View style={styles.switchLeft}>
            <View style={styles.smallBellIcon}>
              <MaterialCommunityIcons 
                name="bell-outline" 
                size={22} 
                color={COLORS.primary} 
                style={styles.iconFix}
              />
            </View>
            <View style={styles.switchTextGroup}>
              <Text style={styles.switchTitle}>Bildirimleri Etkinleştir</Text>
              <Text style={styles.switchSubTitle}>Kelimeler Sana Fısıldasın</Text>
            </View>
          </View>
          
          <CustomSwitch value={isEnabled} onValueChange={toggleSwitch} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Kelime fısıltılarını ne sıklıkla almak istersin?
          </Text>
          <Text style={styles.sectionSubTitle}>İstediğiniz zaman aralığını seçin</Text>
        </View>

        <View style={styles.rangeCard}>
          <View style={styles.rangeHeader}>
            <View>
              <Text style={styles.rangeLabel}>ARALIK</Text>
              <View style={styles.rangeValueRow}>
                <Text style={styles.rangeNumber}>{range}</Text>
                <Text style={styles.rangeUnit}>saat</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="dots-horizontal" size={24} color="#cbd5e1" />
          </View>

          <CustomSlider value={range} onValueChange={(val: number) => setRange(val)} />
          
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>1 SAAT</Text>
            <Text style={styles.sliderLabelText}>4 SAAT</Text>
            <Text style={styles.sliderLabelText}>8 SAAT</Text>
            <Text style={styles.sliderLabelText}>12 SAAT</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="information" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Bildirimler seçtiğiniz aralıklara göre gün içinde rastgele zamanlarda "fısıldanacaktır". 
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable 
          style={styles.saveButton}
          onPress={handleSaveSettings}
        >
          <Text style={styles.saveButtonText}>Ayarları Kaydet</Text>
          <MaterialCommunityIcons name="check-circle" size={18} color={COLORS.white} style={styles.checkIcon} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 60,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingBottom: 20,
    paddingTop: 10,
  },
  topIllustration: {
    alignItems: 'center',
    marginBottom: 25,
  },
  bellWrapper: {
    width: 70,
    height: 70,
    backgroundColor: COLORS.infoBg,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'visible',
  },
  iconFix: {
    marginTop: 2,
    overflow: 'visible',
  },
  illustrationText: {
    fontSize: 14,
    color: COLORS.textGray,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  switchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  smallBellIcon: {
    width: 42,
    height: 42,
    backgroundColor: COLORS.infoBg,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  switchTextGroup: {
    gap: 1,
  },
  switchTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  switchSubTitle: {
    fontSize: 12,
    color: COLORS.textGray,
  },
  sectionHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
    lineHeight: 24,
  },
  sectionSubTitle: {
    fontSize: 13,
    color: COLORS.textGray,
  },
  rangeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    marginBottom: 20,
  },
  rangeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  rangeLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  rangeValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 2,
  },
  rangeNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  rangeUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textGray,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  sliderLabelText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 15,
    padding: 15,
    gap: 10,
    marginBottom: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textGray,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 25,
    paddingTop: 10,
    paddingBottom: 25,
    backgroundColor: COLORS.white,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    elevation: 3,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  checkIcon: {
    marginTop: 1,
  },
  customSwitchContainer: {
    width: 50,
    height: 28,
    borderRadius: 15,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  customSwitchThumb: {
    width: 24,
    height: 24,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  customSliderWrap: {
    height: 40,
    justifyContent: 'center',
    marginBottom: 5,
  },
  customSliderTrack: {
    height: 12,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
    width: '100%',
    position: 'absolute',
  },
  customSliderFill: {
    height: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    position: 'absolute',
  },
  customSliderThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  customSliderTouchArea: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
});