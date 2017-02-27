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

class LanguageSelection extends Component {
 
  constructor(props) {
    super(props);
    var dataSource = new ListView.DataSource(
      {rowHasChanged: (r1, r2) => r1 !== r2});
    const { params } = this.props.navigation.state;
    this.state = {
      dataSource: dataSource.cloneWithRows(params.languages),
      funcLangChange: params.funcLangChange,
      funcTransChange: params.funcTransChange
    };
  }
 
  rowPressed(rowData) {
    // Push name, icon to parent and close
    var icon = rowData.icon
    var lang = rowData.name
    if (icon == '') {icon = null}
    this.state.funcLangChange(lang, icon)
    this.state.funcTransChange(lang)
    const {goBack} = this.props.navigation;
    goBack();

  }
 
  renderRow(rowData, sectionID, rowID) {
    return (
      <TouchableHighlight onPress={() => this.rowPressed(rowData)}
          underlayColor='#dddddd'>
        <View>
          <View style={styles.rowContainer}>
            { rowData.icon != '' ? 
              <Image style={styles.flag} source={{uri:rowData.icon}} /> : null
            }
            <View style={styles.textContainer}>
              <Text style={styles.title}
                    numberOfLines={1}>{rowData.name}</Text>
            </View>
          </View>
          <View style={styles.separator}/>
        </View>
      </TouchableHighlight>
    );
  }

  render() {
    return (
      <ListView 
        dataSource={this.state.dataSource}
        renderRow={this.renderRow.bind(this)}/>
    );
  }
}

const styles = StyleSheet.create({
  flag:{
    borderColor: '#9B9B9B',
    width: 30,
    height: 21,
    marginRight: 5
  },
  textContainer: {
    flex: 1
  },
  separator: {
    height: 1,
    backgroundColor: '#dddddd'
  },
  title: {
    fontSize: 20,
    color: '#656565'
  },
  rowContainer: {
    flexDirection: 'row',
    padding: 10
  }
});

module.exports = LanguageSelection;