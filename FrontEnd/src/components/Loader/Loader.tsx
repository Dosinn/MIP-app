import './Loader.css';

interface LoaderProps {
    size?: number;
    fullPage?: boolean;
}

export function Loader({ size = 32, fullPage = false }: LoaderProps) {
    if (fullPage) {
        return (
            <div className="loaderFullPage">
                <span className="loaderSpinner" style={{ width: size, height: size }} />
            </div>
        );
    }

    return <span className="loaderSpinner" style={{ width: size, height: size }} />;
}

export default Loader;