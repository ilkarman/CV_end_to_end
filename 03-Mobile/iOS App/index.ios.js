'use strict';

var React = require('react');
var ReactNative = require('react-native');

var ClassificationPage = require('./ClassificationPage');

var styles = ReactNative.StyleSheet.create({
  container: {
    flex: 1
  }
});

// I think this has broken it for android
// Use ReactNative.Navigator for android ... but then a few issues?
class AwesomeProject extends React.Component {
  render() {
    return (
      <ReactNative.NavigatorIOS
        style={styles.container}
        navigationBarHidden={true}
        initialRoute={{
          title: '',
          component: ClassificationPage,
        }}/>
    );
  }
}

ReactNative.AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject);