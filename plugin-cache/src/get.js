'use strict';

module.exports = function () {
  var d = this.q.defer();

  if (this.list.length > 0) {
    d.resolve(this.list);
  } else {
    this.on('updated', function (data) {
      d.resolve(data);
    });
    this.on('error', function () {
      d.resolve(this.list);
    }.bind(this));
  }

  return d.promise;
};
