/*!
 * orderColumns layout mode for Isotope
 * v1.0.1
 */

/*jshint browser: true, devel: false, strict: true, undef: true, unused: true */

(function(window) {

	'use strict';

	function orderColumnsDefinition( LayoutMode ) {
		var OrderColumns = LayoutMode.create('orderColumns');

		OrderColumns.prototype._resetLayout = function() {
			this.x = 0;
			this.y = 0;
			this.maxX = 0;
			this.setY = false;
		};

		OrderColumns.prototype._getItemLayoutPosition = function(item) {
			if (!this.setY) {
				this._getContainerSize() ;
				this.setY = true;
			}

			// if this element cannot fit in the current row
			if ( this.y !== 0 && item.size.outerHeight + this.y > this.isotope.size.innerHeight ) {
				this.y = 0;
				this.x = this.maxX;
			}

			var position = {
				x: this.x,
				y: this.y
			};

			this.maxX = Math.max( this.maxX, this.x + item.size.outerWidth );
			this.y += item.size.outerHeight;

			return position;
		};

		OrderColumns.prototype._getContainerSize = function() {
			var columns = [[]]
			  , maxX = 0
			  , minMaxY = 0
			  , isUpdated = true;

			// Get items sizes, fill first column, and get maximum item width
			for (var i = 0; i < this.isotope.items.length; i++) {
				var item = this.isotope.items[i];
				item.getSize();
				columns[0].push(item.size.height);
				maxX = Math.max(maxX, item.size.width);
			}

			// Determine column count
			var columnCount = Math.floor(this.isotope.size.innerWidth / maxX);
			columnCount = (columnCount == 0) ? 1 : columnCount;

			// Create columns
			for (var i = 0; i < columnCount - 1; i++) {
				columns.push([]);
			}

			// Generate sizes to determine lowest maximum column size
			var sizes = [columns.maxSum()];
			while(columns.minSum() <= columns.maxSum() && isUpdated) {
				isUpdated = false;
				for (var i = 0; i < columns.length - 1; i++) {
					// Largest column, push item right
					var columnSum = columns[i].sum();
					if (columnSum == columns.maxSum() && columnSum > columns.minSum()) {
						columns[i+1].unshift(columns[i].pop());
						sizes.push(columns.maxSum());
						isUpdated = true;
						break;
					// Smallest column, take one from right
					} else if (columns[i].sum() == columns.minSum() && columnSum < columns.maxSum() && columns[i+1].length > 0) {
						columns[i].push(columns[i+1].shift());
						sizes.push(columns.maxSum());
					}
				}
			}

			// Get lowest maximum column size
			minMaxY = sizes.min();

			// Set height of container to lowest maximum size
			this.isotope.size.innerHeight = minMaxY;

			return { height: this.isotope.size.innerHeight, width: this.isotope.size.innerWidth };
		};

		Array.prototype.sum = function(selector) {
			if (typeof selector !== 'function') {
				selector = function(item) {
					return item;
				}
			}
			var sum = 0;
			for (var i = 0; i < this.length; i++) {
				sum += parseFloat(selector(this[i]));
			}
			return sum;
		};

		Array.prototype.min = function(selector){
			return Math.min.apply(Math, this);
		};

		Array.prototype.minSum = function(selector){
			var sums = [];
			for (var i = 0; i < this.length; i++) {
				sums.push(this[i].sum());
			}
			return Math.min.apply(Math, sums);
		}

		Array.prototype.maxSum = function(selector){
			var sums = [];
			for (var i = 0; i < this.length; i++) {
				sums.push(this[i].sum());
			}
			return Math.max.apply(Math, sums);
		}

		return OrderColumns;
	}

	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['isotope/js/layout-mode'], orderColumnsDefinition);
	} else if (typeof exports === 'object') {
		// CommonJS
		module.exports = orderColumnsDefinition(require('isotope-layout/js/layout-mode'));
	} else {
		// browser global
		orderColumnsDefinition(window.Isotope.LayoutMode);
	}

})(window);
