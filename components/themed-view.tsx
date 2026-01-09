import { View, ViewProps } from 'react-native';
import { useColorScheme } from 'react-native';
import { MekdiColors } from '../theme/color';

export function ThemedView(props: ViewProps) {
  const scheme = useColorScheme() ?? 'light';
  return (
    <View
      {...props}
      style={[
        { backgroundColor: MekdiColors[scheme].background },
        props.style,
      ]}
    />
  );
}
