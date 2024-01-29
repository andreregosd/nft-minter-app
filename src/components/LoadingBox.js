import gif from '../res/loading.gif';

function LoadingComponent(){
    return (
        <div className="loading-component">
            <p>Your random NFT is being generated...</p>
            <p>This may take a a few minutes</p>
            <img className="loading-gif" src={gif}></img>
        </div>
    );
}

export default LoadingComponent;