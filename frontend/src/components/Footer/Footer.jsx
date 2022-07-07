import './Footer.css'
import fb from '../../assets/facebook.png'
import twitter from '../../assets/twitter.png'
import youtube from '../../assets/youtube.png'
import send from '../../assets/send-plane.png'

function Footer() {
    return (
        <div className='footer'>
            <div className='w-100 pb-2 mx-auto'>
                {/* <div className='d-flex flex-lg-row flex-column justify-content-between'>
                    <div>
                        <p className='text-golden'>Contact</p>
                        <p className='text-white mail'>hello@SolShamans.com</p>
                        <div>
                            <img src={fb} alt="" className='me-4' />
                            <img src={twitter} alt="" className='me-4' />
                            <img src={youtube} alt="" />
                        </div>
                    </div>
                    <div>
                        <p className='text-golden'>Subscribe</p>
                        <div className='p-3 bg-input-box'>
                            <input
                                type="text"
                                className='bg-transparent border-0 outline-0 input me-3 pe-5 w-75'
                                placeholder='Enter your email address' />
                            <img src={send} alt="send"  className='float-end'/>
                        </div>
                    </div>
                </div> */}
                <div className='line mt-5 text-center pt-5'>
                    © 2021 SolShaman
                </div>
            </div>
        </div>
    );
}

export default Footer;