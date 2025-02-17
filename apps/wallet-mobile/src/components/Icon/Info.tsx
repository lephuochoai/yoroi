import * as React from 'react'
import {ImageStyle} from 'react-native'
import Svg, {Path} from 'react-native-svg'

type Props = {
  size?: number
  color?: string
  style?: ImageStyle
}

export const Info = ({size = 40, color = 'black', style = {}}: Props) => {
  return (
    <Svg width={size} height={size} {...style} viewBox="-2 -2 25 25">
      <Path
        d="M12 7C11.4477 7 11 7.44771 11 8C11 8.55229 11.4477 9 12 9H12.01C12.5623 9 13.01 8.55229 13.01 8C13.01 7.44771 12.5623 7 12.01 7H12Z"
        fill={color}
      />

      <Path
        d="M12 10C11.4477 10 11 10.4477 11 11V16C11 16.5523 11.4477 17 12 17C12.5523 17 13 16.5523 13 16V11C13 10.4477 12.5523 10 12 10Z"
        fill={color}
      />

      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4Z"
        fill={color}
      />
    </Svg>
  )
}

export default Info
