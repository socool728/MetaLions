import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useHistory } from 'react-router-dom';
import logo from '../../assets/logo.png'
import { Box, Flex } from '../Box';
import './Header.css';

function Header() {
    const history = useHistory();
    const wallet = useAnchorWallet();

    return (
        <div className=' top-0 bg-black header-wrapper w-100 app-max-width'>
            <div className='m-auto pt-4 pb-2 d-flex justify-content-between header px-5 px-lg-0'>
                <img src={logo} className={'pointer logo'} onClick={()=> history.push('/')} alt=""  />
                <Flex alignItems={'center'} >
                    {wallet && <div className='staking' onClick={()=> history.push('/stake')} >Staking</div>}
                    <Box className={'box'} onClick={()=>{
                        window.open(
                            "https://twitter.com/MetaLionsIO",
                            "_blank"
                          );
                    }}>
                        <i class="fa-brands fa-twitter sicon"></i>
                    </Box>
                    <Box className={'box'} onClick={()=>{
                        window.open(
                            "http://instagram.com/metalionsio",
                            "_blank"
                          );
                    }}>
                        <i class="fa-brands fa-instagram sicon"></i>
                    </Box>
                    <Box className={'box'} onClick={()=>{
                        window.open(
                            "http://discord.gg/metalions",
                            "_blank"
                          );
                    }}>
                        <i class="fa-brands fa-discord sicon"></i>
                    </Box>
                </Flex>

            </div>
        </div>
    );
}


export default Header;