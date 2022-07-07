import React, { useRef } from 'react'
import { SliderContainer, Container } from './style'
import Carousel from 'react-multi-carousel'
import 'react-multi-carousel/lib/styles.css'
interface SliderProps {
  children: any
  itemOverFlow?: boolean
}
const Sliders: React.FC<SliderProps> = ({ children, itemOverFlow }: SliderProps) => {
  const carRef = useRef<any>(null)

  const responsive = {
    largeDesktop: {
      breakpoint: { max: 5000, min: 2501 },
      items: 5,
      partialVisibilityGutter: 0,
    },
    desktop: {
      breakpoint: { max: 2500, min: 1201 },
      items: 3,
      partialVisibilityGutter: 0,
    },
    tablet: {
      breakpoint: { max: 1200, min: 768 },
      items: 3,
      partialVisibilityGutter: 0,
    },
    mobile: {
      breakpoint: { max: 767, min: 0 },
      items: 1,
      partialVisibilityGutter: 0,
    },
  }

  return (
    <SliderContainer>
      <Container className='overflow-visible'>
        <Carousel
          ref={carRef}
          partialVisible
          className={'carousal'}
          autoPlay={false}
          responsive={responsive}
          autoPlaySpeed={999999}
        >
          {children}
        </Carousel>
      </Container>
    </SliderContainer>
  )
}

export default Sliders
