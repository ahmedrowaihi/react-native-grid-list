/* eslint-disable react/prop-types */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, FlatList, View } from 'react-native';

import { colors } from '../../themes';
import generateStyles from './styles';

const GridList = ({
  animationDuration = 500,
  animationInitialBackgroundColor = colors.white,
  itemStyle = {},
  numColumns = 3,
  separatorBorderColor = colors.white,
  separatorBorderWidth = 0,
  showAnimation = false,
  showSeparator = false,
  data = [],
  renderItem,
  children,
}) => {
  const [animatedValue, setAnimatedValue] = useState([]);
  const [animations, setAnimations] = useState([]);
  const flatListRef = useRef(null);
  const stylesRef = useRef({});
  const setup = useMemo(() => {
    if (children) {
      return children;
    } else if (data) {
      return data;
    }
    return [];
  }, [children, data]);
  const _keyExtractor = useCallback((item, index) => index.toString(), []);

  useEffect(() => {
    const stylesOptions = {
      numColumns,
    };

    if (showSeparator) {
      stylesOptions.separatorBorderWidth = separatorBorderWidth;
      stylesOptions.separatorBorderColor = separatorBorderColor;
    }
    if (showAnimation) {
      stylesOptions.animationInitialBackgroundColor = animationInitialBackgroundColor;
    }

    stylesRef.current = generateStyles(stylesOptions);
  }, [animationInitialBackgroundColor, numColumns, separatorBorderColor, separatorBorderWidth, showAnimation, showSeparator]);

  useEffect(() => {
    const newData = setup;
    if (showAnimation) {
      const newAnimatedValue = [];
      const newAnimations = newData.map((_, index) => {
        newAnimatedValue[index] = new Animated.Value(0);
        return Animated.stagger(0, [
          Animated.timing(newAnimatedValue[index], {
            toValue: 1,
            duration: animationDuration * Math.ceil((index + 1) / numColumns),
          }),
        ]);
      });
      setAnimatedValue(newAnimatedValue);
      setAnimations(newAnimations);
    }
  }, [animationDuration, numColumns, setup, showAnimation]);

  const renderItemComponent = useCallback(({ item, index }) => {
    const viewStyles = [stylesRef.current.itemContainer];
    if (showSeparator) {
      viewStyles.push(stylesRef.current.itemContainerSeparator);
    }
    if (showAnimation) {
      viewStyles.push(stylesRef.current.itemContainerAnimationStart);
    }

    viewStyles.push(itemStyle);

    return (
      <View style={viewStyles}>
        {showAnimation ? (
          <Animated.View
            style={[
              stylesRef.current.itemContainerAnimationEnd,
              { opacity: animatedValue[index] },
            ]}
          >
            {renderItem({
              item,
              index,
              animation: animations[index],
            })}
          </Animated.View>
        ) : (
          renderItem({ item, index })
        )}
      </View>
    );
  }, [animatedValue, animations, itemStyle, renderItem, showAnimation, showSeparator]);

  return (
    <FlatList
      ref={flatListRef}
      contentContainerStyle={showSeparator && stylesRef.current.container}
      keyExtractor={_keyExtractor}
      ItemSeparatorComponent={() =>
        showSeparator ? <View style={stylesRef.current.separator} /> : null
      }
      showsVerticalScrollIndicator={false}
      data={setup}
      renderItem={renderItemComponent}
      numColumns={numColumns}
    />
  );
};

export default GridList;
