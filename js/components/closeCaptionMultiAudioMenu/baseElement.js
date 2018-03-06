var React = require('react');

var BaseElement = React.createClass({
  render: function () {
    console.warn('BaseElement props', this.props);
    return (
      <div >
        <span>{this.props.name}</span>
      </div>
    )
  }
});

BaseElement.defaultProps = {
  selected: false,
  name: "",
  id: ""
};

module.exports = BaseElement;