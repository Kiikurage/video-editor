declare module 'react-quick-pinch-zoom' {
    interface Props {
        onUpdate: (data: { x: number; y: number; scale: number }) => void;
        maxZoom?: number;
        minZoom?: number;
        zoomOutFactor?: number;
    }

    const QuickPinchZoom: React.ComponentClass<Props>;

    export default QuickPinchZoom;
}
