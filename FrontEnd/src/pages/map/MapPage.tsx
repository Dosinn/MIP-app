import {useState} from 'react';
import IdeaMap, {type IdeaPoint} from './IdeaMap';
import IdeaDraftInput from './components/IdeaDraftInput.tsx';
import {useDraftPosition} from '../../hooks/useDraftPosition';
import {fastApiClient} from '../../api/apiClient.ts';
import {useQuery} from '@tanstack/react-query';
import './MapPage.css';

function IdeaMapPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const {point, neighbors, loading} = useDraftPosition(title, description);

    const {data: points = []} = useQuery<IdeaPoint[]>({
        queryKey: ['map-points'],
        queryFn: () => fastApiClient.get('/similarity/map').then((res) => res.data),
    });

    return (
        <div className="mapPageContainer">
            <IdeaMap
                points={points}
                myPoint={point ?? undefined}
                connections={neighbors}
            />
            <IdeaDraftInput
                title={title}
                description={description}
                onTitleChange={setTitle}
                onDescriptionChange={setDescription}
                loading={loading}
            />
        </div>
    );
}

export default IdeaMapPage;