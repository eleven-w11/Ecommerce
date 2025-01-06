import React from 'react'
import './styles/BeInspired.css';
import { Link } from 'react-router-dom';

const BeInspired = () => {
    return (
        <>
            <div className="product-display-beinspired bi">
                <h2>Be Inspired</h2>
                <div className="products-video-data">
                    <div className="clintlove">
                        <div className="video-button for-button">
                            <video src="https://baroque.pk/cdn/shop/videos/c/vp/0bf46de8408d43f2a95a61ce1db9cf76/0bf46de8408d43f2a95a61ce1db9cf76.HD-720p-1.6Mbps-34838812.mp4?v=0" muted loop autoPlay preload='auto' ></video>
                            <div className="button-shop-now beinspired-btn">
                                <Link className='shopnow' to="/Products">Shop Now</Link>
                            </div>
                        </div>
                    </div>
                    <div className="celebritystyle">
                        <div className="video-button for-button">
                            <video src="https://baroque.pk/cdn/shop/videos/c/vp/8fc59a5cb22a4beb84cae8305256b751/8fc59a5cb22a4beb84cae8305256b751.HD-1080p-2.5Mbps-28444638.mp4?v=0" muted loop autoPlay preload='auto' ></video>
                            <div className="button-shop-now beinspired-btn">
                                <Link className='shopnow' to="/Products">Shop Now</Link>
                            </div>
                        </div>
                    </div>
                    <div className="stylespotted">
                        <div className="video-button for-button">
                            <video src="https://baroque.pk/cdn/shop/videos/c/vp/c4f8512cecd141088ba3cdfe059a0c55/c4f8512cecd141088ba3cdfe059a0c55.HD-1080p-7.2Mbps-34838829.mp4?v=0" muted loop autoPlay preload='auto' ></video>
                            <div className="button-shop-now beinspired-btn">
                                <Link className='shopnow' to="/Products">Shop Now</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* <svg aria-hidden="true" focusable="false" width="24" class="icon icon-whatsapp" viewBox="0 0 24 24">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M19.354 4.552a10.336 10.336 0 0 0-7.36-3.052C6.257 1.5 1.588 6.168 1.586 11.905a10.383 10.383 0 0 0 1.39 5.202L1.5 22.5l5.516-1.447c1.52.83 3.232 1.266 4.973 1.266h.004c5.736 0 10.404-4.668 10.406-10.405a10.342 10.342 0 0 0-3.045-7.362Zm-7.36 16.01h-.004a8.639 8.639 0 0 1-4.402-1.205l-.316-.188-3.274.859.874-3.192-.206-.327a8.626 8.626 0 0 1-1.322-4.603c.002-4.769 3.882-8.649 8.653-8.649a8.59 8.59 0 0 1 6.115 2.537 8.596 8.596 0 0 1 2.53 6.119c-.002 4.769-3.881 8.649-8.649 8.649Zm4.744-6.477c-.26-.13-1.539-.76-1.777-.846-.239-.087-.412-.13-.585.13s-.672.846-.823 1.02c-.152.173-.304.195-.564.064-.26-.13-1.097-.404-2.09-1.29-.773-.69-1.295-1.54-1.447-1.801-.152-.26-.016-.401.114-.53.116-.117.26-.304.39-.456.13-.152.173-.26.26-.434.087-.173.043-.325-.022-.455s-.584-1.41-.802-1.93c-.21-.508-.425-.439-.584-.447a10.498 10.498 0 0 0-.499-.01.955.955 0 0 0-.693.326c-.239.26-.91.89-.91 2.169 0 1.28.931 2.516 1.061 2.69.13.174 1.834 2.8 4.442 3.926.62.268 1.105.428 1.482.548.623.198 1.19.17 1.638.103.5-.074 1.538-.629 1.755-1.236.216-.607.216-1.128.151-1.236-.064-.109-.238-.174-.498-.304v-.001Z" fill="currentColor"></path>
            </svg> */}
        </>
    )
}

export default BeInspired