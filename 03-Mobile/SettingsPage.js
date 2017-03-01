'use strict';
 
import React, { Component } from 'react'

import {
  StyleSheet,
  Image,
  View,
  TouchableHighlight,
  ListView,
  Text
} from 'react-native'

import SettingsList from 'react-native-settings-list';

class SettingsPage extends Component {
  constructor(props){
    super(props);
    const { params } = this.props.navigation.state;
    this.state = {
      funcLangChange: params.funcLangChange,
      funcTransChange: this.onTranslateChange.bind(this),
      funcDetailChange: params.funcDetailChange,
      detailedSwitch: params.detailedSwitch,
      translateTo: params.translateTo
    };
  }

  handleLanguageResponse(response) {
    const { navigate } = this.props.navigation;
    navigate('Languages',
      {
        languages: response,
        funcLangChange: this.state.funcLangChange,
        funcTransChange: this.state.funcTransChange
      })
  }

  showAvailableLanguages(event) {
    fetch('http://ilkarmanwhatsthis.azurewebsites.net//languages').
    then((response) => response.json())
    .then(responseJson => this.handleLanguageResponse(responseJson.languages))
    .catch((error) => {
      console.error(error);
    })
  }

  onTranslateChange(lang){
    this.setState({translateTo:lang})
  }

  onDetailedSwitch(detail_switch){
    this.setState({detailedSwitch: detail_switch});
    this.state.funcDetailChange(detail_switch);
  }

  render() {
    return (
      <View style={{flex:1}}>
        <View style={{flex:1, marginTop:5}}>
          <SettingsList>
            <SettingsList.Header 
              headerText='SETTINGS' 
              headerStyle={{color:'black', marginTop:10}}/>
            <SettingsList.Item 
              title='Additional Languages' 
              titleInfo={this.state.translateTo}
              onPress={this.showAvailableLanguages.bind(this)}/> 
            <SettingsList.Item
              hasNavArrow={false}
              switchState={this.state.detailedSwitch}
              switchOnValueChange={this.onDetailedSwitch.bind(this)}
              hasSwitch={true}
              title='Generate Description'/>
            <SettingsList.Header 
              headerText='ABOUT' 
              headerStyle={{color:'black', marginTop:50}}/>
            <SettingsList.Item 
              titleInfo='Demo Expires' 
              hasNavArrow={false} 
              title='Whats This v0.0'/>
            <SettingsList.Item title='Privacy & Cookies'/>
            <SettingsList.Item title='Terms of Use'/>
            <SettingsList.Item title='Open Source Licenses'/>
          </SettingsList>
        </View>
      </View>
    );
  }
}

module.exports = SettingsPage;