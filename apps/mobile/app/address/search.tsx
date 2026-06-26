import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import MapView, { Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { PlaceAutocompleteResult } from '@rahaa/shared';
import { COLORS } from '../../constants/colors';
import { PrimaryButton } from '../../components/PrimaryButton';
import { autocompletePlaces, getPlaceDetails, reverseGeocode } from '../../services/places.service';
import { getRecentAddressSearches, addRecentAddressSearch } from '../../utils/recentAddressSearches';
import { useAddressDraftStore } from '../../store/addressDraftStore';

const KIGALI_REGION: Region = {
  latitude: -1.9441,
  longitude: 30.0619,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export default function AddressSearchScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const setDraft = useAddressDraftStore((state) => state.setDraft);
  const { from } = useLocalSearchParams<{ from?: string }>();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceAutocompleteResult[]>([]);
  const [recent, setRecent] = useState<PlaceAutocompleteResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [center, setCenter] = useState(KIGALI_REGION);
  const [label, setLabel] = useState('Downtown Kigali');
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    getRecentAddressSearches().then(setRecent);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const data = await autocompletePlaces(query, center.latitude, center.longitude);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  async function handleRegionChangeComplete(region: Region) {
    setCenter(region);
    try {
      const result = await reverseGeocode(region.latitude, region.longitude);
      setLabel(result.formattedAddress);
    } catch {
      // keep previous label if reverse geocode fails
    }
  }

  async function selectPlace(item: PlaceAutocompleteResult) {
    setQuery('');
    setIsSearchFocused(false);
    setResults([]);
    await addRecentAddressSearch(item);
    getRecentAddressSearches().then(setRecent);

    try {
      const details = await getPlaceDetails(item.placeId);
      const region = {
        latitude: details.lat,
        longitude: details.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setCenter(region);
      setLabel(details.formattedAddress);
      mapRef.current?.animateToRegion(region, 400);
    } catch {
      Alert.alert('Could not load that place', 'Please try selecting it again.');
    }
  }

  async function handleShareLocation() {
    setIsLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) return;
      const position = await Location.getCurrentPositionAsync({});
      const region = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current?.animateToRegion(region, 400);
    } finally {
      setIsLocating(false);
    }
  }

  function handleUseThisLocation() {
    setDraft({ formattedAddress: label, lat: center.latitude, lng: center.longitude });
    if (from === 'details') {
      router.back();
    } else {
      router.push('/address/details');
    }
  }

  const listData = query.trim() ? results : recent;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={KIGALI_REGION}
        onMapReady={() => mapRef.current?.animateToRegion(KIGALI_REGION, 0)}
        onRegionChangeComplete={handleRegionChangeComplete}
        zoomEnabled
        zoomTapEnabled
        zoomControlEnabled
        pitchEnabled
        rotateEnabled
        scrollEnabled
      />

      {!isSearchFocused && (
        <>
          <View style={styles.pinWrap} pointerEvents="none">
            <View style={styles.pinLabel}>
              <Text style={styles.pinLabelText} numberOfLines={1}>
                {label}
              </Text>
            </View>
            <Ionicons name="location" size={40} color={COLORS.primaryGreen} />
          </View>

          <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.shareRow}>
              <Text style={styles.shareText}>
                Sharing your location is the fastest way to check your area.{' '}
                <Text style={styles.shareLink} onPress={handleShareLocation}>
                  Share
                </Text>
              </Text>
              <Pressable style={styles.locateButton} onPress={handleShareLocation} disabled={isLocating}>
                {isLocating ? (
                  <ActivityIndicator size="small" color={COLORS.primaryGreen} />
                ) : (
                  <Ionicons name="locate" size={20} color={COLORS.primaryGreen} />
                )}
              </Pressable>
            </View>
            <PrimaryButton title="Use this location" onPress={handleUseThisLocation} />
          </View>
        </>
      )}

      {isSearchFocused && (
        <View style={[styles.listWrap, { paddingTop: insets.top + 64 }]}>
          {isSearching ? (
            <ActivityIndicator style={styles.listLoading} color={COLORS.primaryGreen} />
          ) : listData.length === 0 ? (
            <Text style={styles.emptyText}>
              {query.trim() ? 'No results found' : 'No recent searches yet'}
            </Text>
          ) : (
            <FlatList
              data={listData}
              keyExtractor={(item) => item.placeId}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <Pressable style={styles.resultRow} onPress={() => selectPlace(item)}>
                  <Ionicons name="arrow-redo-outline" size={18} color={COLORS.textSecondary} />
                  <Text style={styles.resultText} numberOfLines={1}>
                    {query.trim() ? item.mainText : item.description}
                  </Text>
                </Pressable>
              )}
            />
          )}
        </View>
      )}

      <View style={[styles.searchBarWrap, { paddingTop: insets.top + 8 }]}>
        <View style={[styles.searchBar, isSearchFocused && styles.searchBarFocused]}>
          <Pressable
            onPress={() => {
              if (isSearchFocused) {
                setIsSearchFocused(false);
                setQuery('');
              } else {
                router.back();
              }
            }}
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
          </Pressable>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="search location..."
            placeholderTextColor={COLORS.textMuted}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchBarWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorderDefault,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  searchBarFocused: {
    borderColor: COLORS.inputBorderFocused,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  pinWrap: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    transform: [{ translateY: -40 }],
  },
  pinLabel: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 8,
    maxWidth: 260,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  pinLabelText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
  },
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  shareText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  shareLink: {
    color: COLORS.primaryGreen,
    fontWeight: '600',
  },
  locateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
  },
  listLoading: {
    marginTop: 24,
  },
  emptyText: {
    marginTop: 24,
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 14,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  resultText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    flex: 1,
  },
});
