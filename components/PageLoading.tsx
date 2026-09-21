import LoadingScreen from './LoadingScreen';
export default function PageLoading({label}:{label?:string}){ return <LoadingScreen label={label ?? 'Loading'}/>; }
