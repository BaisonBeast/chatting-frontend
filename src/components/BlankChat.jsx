import { FaLock } from "react-icons/fa"
import '../css/BlankChat.css';

const BlankChat = () => {
  return (
    <div className='blankchat'>
        <div className='blankchat_container'>
                <img src='/user.png' alt='users graphic' />
                <div className='blankchat_heading'><h2>Pocket Notes</h2></div>
                <div className='blankchat_para'>
                    <p>Send and receive messages without keeping your phone online.</p>
                    <p>Use Pocket Notes on up to 4 linked devices and 1 mobile phone</p>
                </div>
            <div className='blankchat_encry'>
                <FaLock />
                <p>end-to-end encrypted</p>
            </div>
        </div>
    </div>
  )
}

export default BlankChat