import React, { Component } from 'react';
import { Platform } from 'react-native'
import PropTypes from 'prop-types';
import {
	StyleSheet,
	Text,
	TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { size } from '../helpers/devices';
import * as Statics from '../helpers/statics';
import AppStyles from '../AppStyles';

let CustomScrollView = ScrollView;

export default class CustomTabBar extends Component {
	constructor(props) {
		super(props);

		this.scrollWidth = 0;
		this.scrollHeight = 0;
	}

	tabPressed(i) {
		this.props.goToPage(i);
	}

	render() {
		const newMargin = Statics.IS_ANDROID ? { marginBottom: size(5) } : {};
		const maxHeight = Statics.IS_ANDROID ? { maxHeight: size(70) } : {};
		const {id, tabs} = this.props;
		return (
			<ScrollView
				ref={ (scrollView) => { CustomScrollView = scrollView; } }
				scrollEnabled={ false }
				horizontal
				showsHorizontalScrollIndicator={ false }
				showsVerticalScrollIndicator={ false }
				automaticallyAdjustContentInsets
				scrollEventThrottle={ 200 }
				style={ [styles.container, maxHeight] }
				contentContainerStyle={ [styles.content_container, newMargin] }
				onContentSizeChange={ (contentWidth, contentHeight) => {
					this.scrollWidth = contentWidth;
					this.scrollHeight = contentHeight;
				} }
			>
				{tabs.map((tab, i) => {
					const activeTab = id === i ? { tintColor: AppStyles.colorSet.mainThemeForegroundColor} : { tintColor: 'rgb(209,215,223)'};
					return (
						<TouchableOpacity key={ tab } onPress={ () => this.tabPressed(i) } style={ [styles.tab] }>
							<Image style={ [styles.image_style, activeTab] } source={tab} />
						</TouchableOpacity>);
				})}
			</ScrollView>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		height: size(60),
		maxHeight: size(60),
		backgroundColor: 'white',
	},
	content_container: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
    alignItems: 'center',
		marginTop: Platform.OS === "ios" ? 0 : size(18),
	},
	tab: {
		flex: 0.2,
		// top: 12,
		borderRadius: size(7),
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		// paddingVertical: size(10),
	},
	image_style: {
    width: size(30),
    height: size(30),
    resizeMode: 'contain',
	},
});
