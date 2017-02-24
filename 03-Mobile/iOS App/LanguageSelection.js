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
    this.state = {
      dataSource: dataSource.cloneWithRows(this.props.languages)
    };
    this.func = this.props.func
  }
 
  rowPressed(rowData) {
    // Push name, icon to parent and close
    var lang = rowData.name
    var icon = rowData.icon
    this.func(lang, icon)
    this.props.navigator.pop();
  }
 
  renderRow(rowData, sectionID, rowID) {
    return (
      <TouchableHighlight onPress={() => this.rowPressed(rowData)}
          underlayColor='#dddddd'>

        <View>
          <View style={styles.rowContainer}>

            <View  style={styles.textContainer}>
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