var CSG = require('@jscad/csg').CSG;
var scadAPI = require('@jscad/scad-api');

var cube = scadAPI.primitives3d.cube;
/*var union = scadAPI.booleanOps.union,
    difference = scadAPI.booleanOps.difference;*/

var union = function() {
  return cube({ size: [1, 1, 1], center: true});
}

var difference = function() {
  return cube({ size: [1, 1, 1], center: true});
}

var params = {
  linkSize: 12,
  width: 150,
  height: 150
};

var pi = Math.PI * 1.0;
var tau = pi * 2.0;

function map(stack, cb) {
  if(Array.isArray(stack)) {
    return stack.map(cb);
  } else {
    return cb(stack);
  }
}

function right(x, stack) {
  return map(stack, function(item) {
    return item.translate([+x, 0, 0]);
  });
}

function left(x, stack) {
  return map(stack, function(item) {
    return item.translate([-x, 0, 0]);
  });
}

function back(y, stack) {
  return map(stack, function(item) {
    return item.translate([0, +y, 0]);
  });
}

function fwd(y, stack) {
  return map(stack, function(item) {
    return item.translate([0, -y, 0]);
  });
}

function up(z, stack) {
  return map(stack, function(item) {
    return item.translate([0, 0, +z]);
  });
}

function down(z, stack) {
  return map(stack, function(item) {
    return item.translate([0, 0, -z]);
  });
}

function xRot(x, stack) {
  return map(stack, function(item) {
    return item.rotate([x, 0, 0]);
  });
}

function yRot(y, stack) {
  return map(stack, function(item) {
    return item.rotate([0, y, 0]);
  });
}

function zRot(z, stack) {
  return map(stack, function(item) {
    return item.rotate([0, 0, z]);
  });
}

function xScale(x, stack) {
  return stack.scale([x, 1, 1]);
}

function yScale(y, stack) {
  return stack.scale([1, y, 1]);
}

function zScale(z, stack) {
  return stack.scale([1, 1, z]);
}

function xFlip(x, stack) {
  return stack.mirror([x, 1, 1]);
}

function yFlip(y, stack) {
  return stack.mirror([1, y, 1]);
}

function zFlip(z, stack) {
  return stack.mirror([1, 1, z]);
}

function xSkew(xa, za, stack) {
  var args = [].slice.call(arguments);
  
  if(args.length === 1) {
    ya = 0, za = 0, stack = args[0];
  } else if(args.length === 2) {
    ya = args[0], za = 0, stack = args[1];
  }

  var m = new CSG.Matrix4x4(
    [
      1, 0, 0, 0,
      tan(ya), 1, 0, 0,
      tan(za), 0, 1, 0,
      0, 0, 0, 1
    ]);

  return stack.transform(m);
}

function ySkew(xa, za, stack) {
  var args = [].slice.call(arguments);
  
  if(args.length === 1) {
    xa = 0, za = 0, stack = args[0];
  } else if(args.length === 2) {
    xa = args[0], za = 0, stack = args[1];
  }

  var m = new CSG.Matrix4x4(
    [
      1, tan(xa), 0, 0,
      0, 1, 0, 0,
      0, tan(za), 1, 0,
      0, 0, 0, 1
    ]);

  return stack.transform(m);
}

function zSkew(xa, za, stack) {
  var args = [].slice.call(arguments); 
  
  if(args.length === 1) {
    xa = 0, ya = 0, stack = args[0];
  } else if(args.length === 2) {
    xa = args[0], ya = 0, stack = args[1];
  }

  var m = new CSG.Matrix4x4(
    [
      1, 0, tan(xa), 0,
      0, tan(za), 1, 0,
      0, 0, 0, 1
    ]);

  return stack.transform(m);
}

function xSpread(spacing, n, cb) {
  var args = [].slice.call(arguments); 
  
  if(args.length === 1) {
    spacing = 1, n = 2, cb = args[0];
  } else if(args.length === 2) {
    spacing = args[0], n = 2, cb = args[1];
  }

  var items;
  for(var i = 0; i < n; i++) {
    items = map(cb(), function(item) {
      return right((i - n / 2.0) * spacing, item);
    });
  }

  return items;
}

function ySpread(spacing, n, cb) {
  var args = [].slice.call(arguments); 
  
  if(args.length === 1) {
    spacing = 1, n = 2, cb = args[0];
  } else if(args.length === 2) {
    spacing = args[0], n = 2, cb = args[1];
  }

  var items;
  for(var i = 0; i < n; i++) {
    items = map(cb(), function(item) {
      return back((i - n / 2.0) * spacing, item);
    });
  }

  return items;
}

function zSpread(spacing, n, cb) {
  var args = [].slice.call(arguments); 
  
  if(args.length === 1) {
    spacing = 1, n = 2, cb = args[0];
  } else if(args.length === 2) {
    spacing = args[0], n = 2, cb = args[1];
  }

  var items;
  for(var i = 0; i < (n - 1); i++) {
    items = map(cb(), function(item) {
      return up((i - n / 2.0) * spacing, item);
    });
  }

  return items;
}

var links = 0;
function link(size) {
  var gap = 0.5,
      height = size / 3,
      wall = size / 6,
      chamfer = wall / 2,
      strut = height * 2/5 - gap/2;

  return union(
    difference(
      cube({ size: [size, size, height], center: true }),
      xSpread(size, function() {
          return ySpread(size, function() {
              return zRot(45,
                cube({ size: [chamfer * Math.sqrt(2), chamfer * Math.sqrt(2), height + 1], center: true})
              )
            }
          )
        }
      ),
      xSpread(size, function() {
          return down(height/2,
            yRot(45,
              cube({ size: [chamfer * Math.sqrt(2), size + 1, chamfer * Math.sqrt(2)], center: true })
            )
          )
        }
      ),
      ySpread(size, function() {
          return up(height/2,
            xRot(45,
              cube({ size: [size + 1, chamfer * Math.sqrt(2), chamfer * Math.sqrt(2)], center: true})
            )
          )
        }
      ),
      down(strut,
        difference(
          cube({ size: [size + 1, wall * 4, height], center: true }),
          ySpread(wall * 4, function() {
              return up(height / 2,
                xRot(45,
                  cube({ size: [size + 2, wall/Math.sqrt(2), wall/Math.sqrt(2)], center: true})
                )
              )
            }
          )
        )
      ),
      up(strut,
        difference(
          cube({ size: [wall * 4, size + 1, height], center: true }),
          xSpread(wall * 4, function() {
              return down(height / 2,
                yRot(45,
                  cube({ size: [wall / Math.sqrt(2), size + 2, wall / Math.sqrt(2)], center: true })
                )
              )
            }
          )
        )
      )
    ),
    up(height / 2,
      difference(
        xRot(45,
          cube({ size: [size, 2 * strut / Math.sqrt(2), 2 * strut / Math.sqrt(2)], center: true })
        ),
        up(strut + 0.5,
          cube({ size: [size + 1, strut * 2 + 1, strut * 2 + 1], center: true})
        ),
        down(2 * strut - 0.3,
          cube({ size: [size + 1, strut * 2, strut * 2], center: true})
        )
      )
    ),
    down(height / 2,
      difference(
        yRot(45,
          cube({ size: [2 * strut / Math.sqrt(2), size, 2 * strut / Math.sqrt(2)], center: true})
        ),
        down(strut + 0.5,
          cube({ size: [strut * 2 + 1, size + 1, strut * 2 + 1], center: true})
        )
      )
    ),
    zRot(45,
      cube({ size: [2 * strut / Math.sqrt(2), 2 * strut / Math.sqrt(2), height], center: true})
    )
  );
}

var spacing   = params.linkSize * 1.20,
    rowCount  = Math.floor(params.height / (spacing / Math.sqrt(2)) - 0.5),
    colCount  = Math.floor(params.width  / (spacing / Math.sqrt(2)) - 0.5);

function main() {
  return difference(
    up(params.linkSize / 6 + 0.25,
      xSpread(spacing / Math.sqrt(2), colCount, function() {
          return ySpread(spacing / Math.sqrt(2), rowCount, function() {
              return zRot(45,
                link(params.linkSize)
              )
            }
          )
        }
      )
    ),
    xSpread(spacing / Math.sqrt(2), colCount, function() {
        return fwd(spacing * (rowCount - 0.5) / 2 / Math.sqrt(2),
          zRot(-45,
            right(params.linkSize / 4,
              cube({ size: [params.linkSize / 2, 0.5, params.linkSize], center: true })
            )
          )
        )
      }
    ),
    ySpread(spacing / Math.sqrt(2), rowCount, function() {
        return left(spacing * (colCount - 0.5) / 2 / Math.sqrt(2),
          zRot(-45,
            left(params.linkSize / 4,
              cube({ size: [params.linkSize / 2, 0.5, params.linkSize], center: true })
            )
          )
        )
      }
    )
  );
}

main();
