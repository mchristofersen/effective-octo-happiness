'use strict';

var assign = require('lodash/object/assign'),
    forEach = require('lodash/collection/forEach');

var Snap = require('../../../vendor/snapsvg');

var round = Math.round;


function BendpointSnapping(eventBus) {

  function snapTo(candidates, point) {
    return Snap.snapTo(candidates, point);
  }

  function mid(element) {
    if (element.width) {
      return {
        x: round(element.width / 2 + element.x),
        y: round(element.height / 2 + element.y)
      };
    }
  }

  ////////// connection segment snapping //////////////////////////////////////

  function getConnectionSegmentSnaps(context) {

    var snapPoints = context.snapPoints,
        connection = context.connection,
        waypoints = connection.waypoints,
        segmentStart = context.segmentStart,
        segmentStartIndex = context.segmentStartIndex,
        segmentEnd = context.segmentEnd,
        segmentEndIndex = context.segmentEndIndex,
        axis = context.axis;

    if (snapPoints) {
      return snapPoints;
    }

    var referenceWaypoints = [
      waypoints[segmentStartIndex - 1],
      segmentStart,
      segmentEnd,
      waypoints[segmentEndIndex + 1]
    ];

    if (segmentStartIndex < 2) {
      referenceWaypoints.unshift(mid(connection.source));
    }

    if (segmentEndIndex > waypoints.length - 3) {
      referenceWaypoints.unshift(mid(connection.target));
    }

    context.snapPoints = snapPoints = { horizontal: [] , vertical: [] };

    forEach(referenceWaypoints, function(p) {
      // we snap on existing bendpoints only,
      // not placeholders that are inserted during add
      if (p) {
        p = p.original || p;

        if (axis === 'y') {
          snapPoints.horizontal.push(p.y);
        }

        if (axis === 'x') {
          snapPoints.vertical.push(p.x);
        }
      }
    });

    return snapPoints;
  }

  eventBus.on('connectionSegment.move.move', 1500, function(event) {
    var context = event.context,
        snapPoints = getConnectionSegmentSnaps(context),
        x = event.x,
        y = event.y,
        sx, sy;

    if (!snapPoints) {
      return;
    }

    // snap
    sx = snapTo(snapPoints.vertical, x);
    sy = snapTo(snapPoints.horizontal, y);


    // correction x/y
    var cx = (x - sx),
        cy = (y - sy);

    // update delta
    assign(event, {
      dx: event.dx - cx,
      dy: event.dy - cy,
      x: sx,
      y: sy
    });
  });


  ///////// bendpoint snapping /////////////////////////////

  function getBendpointSnaps(context) {

    var snapPoints = context.snapPoints,
        waypoints = context.connection.waypoints,
        bendpointIndex = context.bendpointIndex;

    if (snapPoints) {
      return snapPoints;
    }

    var referenceWaypoints = [ waypoints[bendpointIndex - 1], waypoints[bendpointIndex + 1] ];

    context.snapPoints = snapPoints = { horizontal: [] , vertical: [] };

    forEach(referenceWaypoints, function(p) {
      // we snap on existing bendpoints only,
      // not placeholders that are inserted during add
      if (p) {
        p = p.original || p;

        snapPoints.horizontal.push(p.y);
        snapPoints.vertical.push(p.x);
      }
    });

    return snapPoints;
  }


  eventBus.on('bendpoint.move.move', 1500, function(event) {

    var context = event.context,
        snapPoints = getBendpointSnaps(context),
        target = context.target,
        targetMid = target && mid(target),
        x = event.x,
        y = event.y,
        sx, sy;

    if (!snapPoints) {
      return;
    }

    // snap
    sx = snapTo(targetMid ? snapPoints.vertical.concat([ targetMid.x ]) : snapPoints.vertical, x);
    sy = snapTo(targetMid ? snapPoints.horizontal.concat([ targetMid.y ]) : snapPoints.horizontal, y);


    // correction x/y
    var cx = (x - sx),
        cy = (y - sy);

    // update delta
    assign(event, {
      dx: event.dx - cx,
      dy: event.dy - cy,
      x: event.x - cx,
      y: event.y - cy
    });
  });
}


BendpointSnapping.$inject = [ 'eventBus' ];

module.exports = BendpointSnapping;