import React, { useContext, useEffect, useRef, useState } from 'react';
import {
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	TextField,
} from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { useTranslation } from 'react-i18next';
import { AxiosResponse } from 'axios';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import { loadGoogleMaps } from '@src/helpers/GoogleMapsHelper';
import { MessageType } from '@src/types/messages';
import * as Styled from './LocationModal.styles';

interface Props {
	open: boolean;
	onClose: () => void;
	sendMessage: (
		payload: any,
		onSuccess: () => void,
		onError: (error: AxiosResponse) => void
	) => void;
	recipientWaId: string | undefined;
}

interface LatLng {
	lat: number;
	lng: number;
}

const DEFAULT_CENTER: LatLng = { lat: 20, lng: 0 };
const DEFAULT_ZOOM = 2;
const SELECTED_ZOOM = 15;

// Normalizes google.maps.LatLng instances and plain literals
const toLatLngLiteral = (value: any): LatLng | undefined => {
	if (!value) return undefined;
	return {
		lat: typeof value.lat === 'function' ? value.lat() : value.lat,
		lng: typeof value.lng === 'function' ? value.lng() : value.lng,
	};
};

const LocationModal: React.FC<Props> = ({
	open,
	onClose,
	sendMessage,
	recipientWaId,
}) => {
	const config = useContext(AppConfigContext);
	const { t } = useTranslation();

	const mapCanvasRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<any>(null);
	const markerRef = useRef<any>(null);
	const geocoderRef = useRef<any>(null);

	const [isMapLoading, setMapLoading] = useState(true);
	const [mapError, setMapError] = useState(false);
	const [isSending, setSending] = useState(false);
	const [isLocating, setLocating] = useState(false);
	const [position, setPosition] = useState<LatLng>();
	const [name, setName] = useState('');
	const [address, setAddress] = useState('');

	const selectPosition = (latLng: LatLng, pan: boolean = false) => {
		setPosition(latLng);

		if (markerRef.current) {
			markerRef.current.position = latLng;
		}

		if (pan && mapRef.current) {
			mapRef.current.panTo(latLng);
			mapRef.current.setZoom(SELECTED_ZOOM);
		}

		// Suggest an address for the selected point
		try {
			geocoderRef.current?.geocode(
				{ location: latLng },
				(results: any[], status: string) => {
					if (status === 'OK' && results?.[0]) {
						setAddress(results[0].formatted_address ?? '');
					} else if (status === 'REQUEST_DENIED') {
						// The API key is not authorized for the Geocoding API;
						// stop trying, the address can still be typed manually
						console.warn(
							'Geocoding is not available for this API key. Address suggestions are disabled.'
						);
						geocoderRef.current = null;
					}
				}
			);
		} catch (error) {
			console.warn(error);
			geocoderRef.current = null;
		}
	};

	// Keep the latest selectPosition reachable from map listeners
	const selectPositionRef = useRef(selectPosition);
	selectPositionRef.current = selectPosition;

	useEffect(() => {
		if (!open) return;

		let isCancelled = false;

		const initMap = async () => {
			try {
				const maps = await loadGoogleMaps(
					config?.APP_GOOGLE_MAPS_API_KEY ?? ''
				);
				const [{ Map }, { AdvancedMarkerElement }, { Geocoder }] =
					await Promise.all([
						maps.importLibrary('maps'),
						maps.importLibrary('marker'),
						maps.importLibrary('geocoding'),
					]);

				if (isCancelled || !mapCanvasRef.current) return;

				const map = new Map(mapCanvasRef.current, {
					center: DEFAULT_CENTER,
					zoom: DEFAULT_ZOOM,
					// Advanced markers require a map id; DEMO_MAP_ID is the
					// documented fallback when no custom map id is configured
					mapId: config?.APP_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID',
					streetViewControl: false,
					mapTypeControl: false,
					fullscreenControl: false,
					clickableIcons: false,
				});

				// Without a position the marker stays hidden until first selection
				const marker = new AdvancedMarkerElement({
					map,
					gmpDraggable: true,
				});

				map.addListener('click', (event: any) => {
					const latLng = toLatLngLiteral(event.latLng);
					if (latLng) selectPositionRef.current(latLng);
				});

				marker.addListener('dragend', () => {
					const latLng = toLatLngLiteral(marker.position);
					if (latLng) selectPositionRef.current(latLng);
				});

				mapRef.current = map;
				markerRef.current = marker;
				geocoderRef.current = new Geocoder();

				setMapLoading(false);
			} catch (error) {
				console.error(error);
				if (!isCancelled) {
					setMapError(true);
					setMapLoading(false);
				}
			}
		};

		initMap();

		return () => {
			isCancelled = true;
		};
	}, [open]);

	const geolocationErrorMessage = (error: GeolocationPositionError) => {
		switch (error.code) {
			case error.PERMISSION_DENIED:
				return t(
					'Location permission was denied. Please allow location access for this site in your browser settings.'
				);
			case error.POSITION_UNAVAILABLE:
				return t(
					'Your location could not be determined. Please make sure Location Services are enabled for your browser in your system settings.'
				);
			case error.TIMEOUT:
				return t('Retrieving your location took too long. Please try again.');
			default:
				return t('Unable to retrieve your location.');
		}
	};

	const useCurrentLocation = () => {
		if (!navigator.geolocation) {
			window.displayCustomError(
				t('Geolocation is not supported by your browser.')
			);
			return;
		}

		const onSuccess = (browserPosition: GeolocationPosition) => {
			setLocating(false);
			selectPositionRef.current(
				{
					lat: browserPosition.coords.latitude,
					lng: browserPosition.coords.longitude,
				},
				true
			);
		};

		setLocating(true);

		// First try a fast, high-accuracy fix; desktop devices without GPS
		// often cannot provide one, so fall back to a low-accuracy request
		// that also accepts a recently cached position.
		navigator.geolocation.getCurrentPosition(
			onSuccess,
			(error) => {
				if (error.code === error.PERMISSION_DENIED) {
					setLocating(false);
					window.displayCustomError(geolocationErrorMessage(error));
					return;
				}

				console.warn('Retrying geolocation with low accuracy.', error);
				navigator.geolocation.getCurrentPosition(
					onSuccess,
					(fallbackError) => {
						setLocating(false);
						console.warn(fallbackError);
						window.displayCustomError(geolocationErrorMessage(fallbackError));
					},
					{
						enableHighAccuracy: false,
						timeout: 15000,
						maximumAge: 5 * 60 * 1000,
					}
				);
			},
			{ enableHighAccuracy: true, timeout: 10000, maximumAge: 60 * 1000 }
		);
	};

	const handleClose = () => {
		onClose();
		setPosition(undefined);
		setName('');
		setAddress('');
		setSending(false);
		setLocating(false);
		setMapLoading(true);
		setMapError(false);
		mapRef.current = null;
		markerRef.current = null;
		geocoderRef.current = null;
	};

	const handleSend = () => {
		if (!position || isSending) return;

		setSending(true);

		const trimmedName = name.trim();
		const trimmedAddress = address.trim();

		const payload = {
			wa_id: recipientWaId,
			type: MessageType.location,
			location: {
				latitude: position.lat,
				longitude: position.lng,
				...(trimmedName ? { name: trimmedName } : {}),
				...(trimmedAddress ? { address: trimmedAddress } : {}),
			},
		};

		sendMessage(payload, handleClose, (error: AxiosResponse) => {
			console.log('error', error);
			setSending(false);
		});
	};

	return (
		<Dialog open={open} onClose={handleClose} fullWidth>
			<Styled.StyledDialogTitle>{t('Send location')}</Styled.StyledDialogTitle>
			<Styled.StyledDialogContent>
				<Styled.MapWrapper>
					{/* Google Maps owns this element's DOM; keep it childless */}
					<Styled.MapCanvas ref={mapCanvasRef} />

					{isMapLoading && !mapError && (
						<Styled.MapOverlay>
							<CircularProgress size={28} />
						</Styled.MapOverlay>
					)}

					{mapError && (
						<Styled.MapOverlay>
							{t('The map could not be loaded. Please try again later.')}
						</Styled.MapOverlay>
					)}
				</Styled.MapWrapper>

				<Styled.CurrentLocationRow>
					<Button
						color="primary"
						size="small"
						startIcon={
							isLocating ? <CircularProgress size={16} /> : <MyLocationIcon />
						}
						onClick={useCurrentLocation}
						disabled={isLocating || mapError}
					>
						{t('Use my current location')}
					</Button>
				</Styled.CurrentLocationRow>

				{position && (
					<Styled.Coordinates>
						{position.lat.toFixed(6)}, {position.lng.toFixed(6)}
					</Styled.Coordinates>
				)}

				<Styled.Fields>
					<TextField
						value={name}
						onChange={(event) => setName(event.target.value)}
						label={t('Location name (optional)')}
						size="small"
						variant="standard"
						fullWidth
					/>
					<TextField
						value={address}
						onChange={(event) => setAddress(event.target.value)}
						label={t('Address (optional)')}
						size="small"
						variant="standard"
						fullWidth
					/>
				</Styled.Fields>
			</Styled.StyledDialogContent>
			<DialogActions>
				<Button onClick={handleClose} color="secondary">
					{t('Cancel')}
				</Button>
				<Button onClick={handleSend} disabled={!position || isSending}>
					{isSending ? t('Sending...') : t('Send')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default LocationModal;
