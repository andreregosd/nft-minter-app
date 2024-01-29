import './App.css';
import { ethers } from "ethers";
import { useState } from "react";
import { nftMinterContractAddress, nftMinterAbi, collectionName } from './constants/constants';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingComponent from './components/LoadingBox';

function App() {
  const [NFTMinter, setNFTMinter] = useState();
  const [isConnected, setIsConnected] = useState(false);
  const [signer, setSigner] = useState();
  const [requestingNFT, setRequestingNFT] = useState(false);
  const [nftMinted, setNFTMinted] = useState(false);
  const [nftTokenId, setnftTokenId] = useState(); 
  const [nftImageURL, setNFTImageURL] = useState(); 
  const [nftName, setNFTName] = useState(); 
  const [nftDescription, setNFTDescription] = useState(); 

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try{
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        setSigner(signer);

        const contract = await new ethers.Contract(nftMinterContractAddress, nftMinterAbi, signer);
        setNFTMinter(contract);
        setIsConnected(true);
      }
      catch(e){
        toast.error("An error ocurred");
        console.log(e);
        return;
      }
      
      toast.success('Connected');
    } 
    else {
      console.log("Please Install Metamask!!!");
    }
  }

  const mint = async () => {
    setRequestingNFT(true);
    try {
      let tx = await NFTMinter.generateNFT();
      await tx.wait();

      NFTMinter.on("NFTMinted", async (lastTokenId, nftOwner) => {
        if(nftOwner == signer.address) {
          await setNFTInfo(lastTokenId);
        }
        setRequestingNFT(false);
        toast.success('NFT Minted');
      });
    }
    catch(e) {
      setRequestingNFT(false);
      toast.error("An error ocurred");
      console.log(e);
      return;
    }
  }

  const setNFTInfo = async (tokenId) => {
    let nftUri = await NFTMinter.tokenURI(tokenId);
    const tokenURL = nftUri.replace("ipfs://", "https://ipfs.io/ipfs/");
    const tokenURIResponse = await (await fetch(tokenURL)).json();
    setnftTokenId(tokenId);
    setNFTImageURL(tokenURIResponse.image.replace("ipfs://", "https://ipfs.io/ipfs/"));
    setNFTName(tokenURIResponse.name);
    setNFTDescription(tokenURIResponse.description);
    setNFTMinted(true);
  }

  return (
    <div className="App">
      <ToastContainer position="bottom-center" limit={1} />
      <div className="site-container">
        <h1>NFT Minter</h1>
        <div className="info-container">
          <div className="info">Get a random NFT of the collection 'Animals in tuxedo'</div>
          <div className="small-info">This app uses chainlink's vrf to randomize the NFT generation</div>
        </div>
        {
          !isConnected ? 
            <button className="" onClick={ () => connectWallet() }>Connect</button>
          : !nftMinted && !requestingNFT ?
            <button className="" onClick={ () => mint() }>Mint</button>
          : null
        }
        {
          requestingNFT ? 
            <LoadingComponent></LoadingComponent>
          : null
        }  
        {
          nftMinted ?
          <div className="nft-content">
            <div className="nft-image-container">
              <img className="nft-image" src={nftImageURL} alt="" />
            </div>
            <div className="nft-info">
              <div className="nft-address">{nftMinterContractAddress}</div>
              <h3>{collectionName}</h3>
              <label>Token id</label>
              <div className="nft-token-id">{nftTokenId.toString()}</div>
              <label>Name</label>
              <div className="nft-name">{nftName}</div>
              <label>Description</label>
              <div className="nft-description">{nftDescription}</div>
            </div>
          </div>
          :
          null
        }   
      </div>
    </div>
  );
}

export default App;
