import "./Home.css";
import { Button } from "reactstrap";
import { shortenAddress } from "../../candy-machine";
import styled from "styled-components";
import Png9 from "../../assets/9.png";

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { WalletDialogButton } from "@solana/wallet-adapter-material-ui";
import { Flex } from "../../components/Box";
import useViewport from "../../hooks/useViewport";
import { useHistory } from "react-router-dom";
import { useEffect, useState } from "react";

const ConnectButton = styled(WalletDialogButton)`
  background : white;
`;

const HomeHero = () => {
  const wallet = useAnchorWallet();
  const { width } = useViewport()
  const history = useHistory()
  const [ isConnected , setIsConnected ] = useState<boolean>(false)

  const isMobile = width <= 990

  useEffect(()=>{
    if(isConnected && wallet){
      setIsConnected(false)
      history.push('/stake')
    }
  },[isConnected , wallet , history])

  return (
    <Flex className={"bg-image"} alignItems={"center"}>
      <Flex
        width={"100%"}
        alignItems={"center"}
        flexDirection={isMobile? 'column' : 'row'}
        justifyContent={"space-between"}
        mt={isMobile? '300px' :'-130px'}
      >
        <Flex className="col-lg-6 col-12 " ml={'auto'} justifyContent={"end"}>
          <Flex flexDirection={'column'} alignItems={'center'}>
          <img src={Png9} width={'100%'} alt="" />
          <div className="welcome-text">WELCOME TO METALIONS STAKING DAPP</div>
          <div className="sub-text text-center">Metalions NFT is a collection of Custom Designed Lions that are<br/> here to rule the Solana Network</div>
          {!wallet ? (
            <ConnectButton onClick={()=> {
              localStorage.clear()
              setIsConnected(true)}
              } className="btn-outline-warning bg-transparent rounded-13 text-34 fw-bold p-2">
              Connect Wallet
            </ConnectButton>
          ) : (
            <Button onClick={()=> history.push('/stake')} className="btn-outline-warning bg-transparent rounded-13 text-24 fw-bold p-2">
              {shortenAddress(wallet.publicKey.toBase58() || "")}
            </Button>
          )}
          </Flex>

        </Flex>
        <Flex className="col-lg-6 col-12 gif-box" justifyContent={"end"}  alignItems={'center'} >
        </Flex>
      </Flex>
    </Flex>
  );
};

export default HomeHero;

