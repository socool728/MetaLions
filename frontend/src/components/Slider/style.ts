import styled from 'styled-components'
import { Box } from '../Box'

export const Container = styled.div`
  position: relative;
  margin-bottom: 50px;
  overflow: hidden !important;

  &.overflow-visible {
    .owl-stage-outer {
      overflow: visible;
    }
  }

  .owl-carousel {
    position: static;
    width: 85%;
    margin-top: 60px;

    @media (min-width: 1600px) {
      width: 90%;
    }

    .owl-stage-outer {
      width: max-content;
    }
  }

  .carousal ul li {
    padding: 40px 40px 20px 0;
  }

  .line {
    width: 100%;
  }

  .height-class {
    height: auto;
  }

  .control {
    position: absolute;
    top: 0;
    right: 0;

    @media (max-width: 575px) {
      top: 6px;
    }

    .disable {
      color: #aca7b4;
      background: #e9e9e9;
    }

    .control-right-icon {
      border: 0;
      outline: 0;
      width: 38px;
      height: 38px;
      border-radius: 12px;
      margin-left: 1.25rem;
      border: 0.5px solid red;
      color: white;
      background: blue;

      @media (max-width: 575px) {
        width: 30px;
        height: 30px;
        margin-left: 0.5rem;
      }

      svg {
        color: green;

        @media (max-width: 575px) {
          width: auto;
          height: 13px;
        }
      }

      &.disabled {
        color: #aca7b4;
        background: #e9e9e9;
        display: none;
      }
    }

    .control-left-icon {
      border: 0;
      outline: 0;
      width: 38px;
      height: 38px;
      border-radius: 12px;
      color: red;
      background: white;
      border: 0.5px solid green;

      @media (max-width: 575px) {
        width: 30px;
        height: 30px;
      }

      svg {
        color: blue;

        @media (max-width: 575px) {
          width: auto;
          height: 13px;
        }
      }

      &.disabled {
        color: #aca7b4;
        background: #e9e9e9;
        display: none;
      }
    }
  }
`

export const SliderContainer = styled.div`
  .head-title {
    font-family: 'Futura Std Medium Oblique';
    font-size: 28px;
    line-height: 34px;
    text-transform: uppercase;
    color: #030c26;
  }

  .slider-card {
    @media (min-width: 1600px) {
      width: 100%;
    }
  }

  .carousal {
    position: relative;
    padding-top: 20px;
  }
`

export const ButtonContainer = styled(Box)`
  width: 54px;
  height: 54px;
  border: 0.5px solid black;
  background: white;
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  margin-right: 10px;
  cursor: pointer;
`
