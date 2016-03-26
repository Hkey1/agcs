/*!
 * Snowball JavaScript Library v0.4
 * http://snowball.tartarus.org/
 * https://github.com/mazko/jssnowball
 *
 * Copyright 13.01.02 23:17:29, Oleg Mazko
 * http://www.opensource.org/licenses/bsd-license.html
 */
function ag_Snowball(lng) {
	function Among(s, substring_i, result, method) {
		if ((!s && s != "") || (!substring_i && (substring_i != 0)) || !result)
			throw ("Bad Among initialisation: s:" + s + ", substring_i: "
					+ substring_i + ", result: " + result);
		this.s_size = s.length;
		this.s = (function() {
			var sLength = s.length, charArr = new Array(sLength);
			for (var i = 0; i < sLength; i++)
				charArr[i] = s.charCodeAt(i);
			return charArr;})();
		this.substring_i = substring_i;
		this.result = result;
		this.method = method;
	}
	function SnowballProgram() {
		var current;
		return {
			bra : 0,
			ket : 0,
			limit : 0,
			cursor : 0,
			limit_backward : 0,
			setCurrent : function(word) {
				current = word;
				this.cursor = 0;
				this.limit = word.length;
				this.limit_backward = 0;
				this.bra = this.cursor;
				this.ket = this.limit;
			},
			getCurrent : function() {
				var result = current;
				current = null;
				return result;
			},
			in_grouping : function(s, min, max) {
				if (this.cursor >= this.limit) return false;
				var ch = current.charCodeAt(this.cursor);
				if (ch > max || ch < min) return false;
				ch -= min;
				if ((s[ch >> 3] & (0X1 << (ch & 0X7))) == 0) return false;
				this.cursor++;
				return true;
			},
			in_grouping_b : function(s, min, max) {
				if (this.cursor <= this.limit_backward) return false;
				var ch = current.charCodeAt(this.cursor - 1);
				if (ch > max || ch < min) return false;
				ch -= min;
				if ((s[ch >> 3] & (0X1 << (ch & 0X7))) == 0) return false;
				this.cursor--;
				return true;
			},
			out_grouping : function(s, min, max) {
				if (this.cursor >= this.limit) return false;
				var ch = current.charCodeAt(this.cursor);
				if (ch > max || ch < min) {
					this.cursor++;
					return true;
				}
				ch -= min;
				if ((s[ch >> 3] & (0X1 << (ch & 0X7))) == 0) {
					this.cursor ++;
					return true;
				}
				return false;
			},
			out_grouping_b : function(s, min, max) {
				if (this.cursor <= this.limit_backward) return false;
				var ch = current.charCodeAt(this.cursor - 1);
				if (ch > max || ch < min) {
					this.cursor--;
					return true;
				}
				ch -= min;
				if ((s[ch >> 3] & (0X1 << (ch & 0X7))) == 0) {
					this.cursor--;
					return true;
				}
				return false;
			},
			eq_s : function(s_size, s) {
				if (this.limit - this.cursor < s_size) return false;
				var i;
				for (i = 0; i != s_size; i++) {
					if (current.charCodeAt(this.cursor + i) != s.charCodeAt(i)) return false;
				}
				this.cursor += s_size;
				return true;
			},
			eq_s_b : function(s_size, s) {
				if (this.cursor - this.limit_backward < s_size) return false;
				var i;
				for (i = 0; i != s_size; i++) {
					if (current.charCodeAt(this.cursor - s_size + i) != s.charCodeAt(i)) return false;
				}
				this.cursor -= s_size;
				return true;
			},
			eq_v_b : function(s) {
				return this.eq_s_b(s.length, s);
			},
			find_among : function(v, v_size) {
				var i = 0, j = v_size, c = this.cursor, l = this.limit, common_i = 0, common_j = 0, first_key_inspected = false;
				while (true) {
					var k = i + ((j - i) >> 1), diff = 0, common = common_i < common_j
							? common_i
							: common_j, w = v[k];
					for (var i2 = common; i2 < w.s_size; i2++) {
						if (c + common == l) {
							diff = -1;
							break;
						}
						diff = current.charCodeAt(c + common) - w.s[i2];
						if (diff)
							break;
						common++;
					}
					if (diff < 0) {
						j = k;
						common_j = common;
					} else {
						i = k;
						common_i = common;
					}
					if (j - i <= 1) {
						if (i > 0 || j == i || first_key_inspected)
							break;
						first_key_inspected = true;
					}
				}
				while (true) {
					var w = v[i];
					if (common_i >= w.s_size) {
						this.cursor = c + w.s_size;
						if (!w.method)
							return w.result;
						var res = w.method();
						this.cursor = c + w.s_size;
						if (res)
							return w.result;
					}
					i = w.substring_i;
					if (i < 0)
						return 0;
				}
			},
			find_among_b : function(v, v_size) {
				var i = 0, j = v_size, c = this.cursor, lb = this.limit_backward, common_i = 0, common_j = 0, first_key_inspected = false;
				while (true) {
					var k = i + ((j - i) >> 1), diff = 0, common = common_i < common_j
							? common_i
							: common_j, w = v[k];
					for (var i2 = w.s_size - 1 - common; i2 >= 0; i2--) {
						if (c - common == lb) {
							diff = -1;
							break;
						}
						diff = current.charCodeAt(c - 1 - common) - w.s[i2];
						if (diff)
							break;
						common++;
					}
					if (diff < 0) {
						j = k;
						common_j = common;
					} else {
						i = k;
						common_i = common;
					}
					if (j - i <= 1) {
						if (i > 0 || j == i || first_key_inspected)
							break;
						first_key_inspected = true;
					}
				}
				while (true) {
					var w = v[i];
					if (common_i >= w.s_size) {
						this.cursor = c - w.s_size;
						if (!w.method)
							return w.result;
						var res = w.method();
						this.cursor = c - w.s_size;
						if (res)
							return w.result;
					}
					i = w.substring_i;
					if (i < 0)
						return 0;
				}
			},
			replace_s : function(c_bra, c_ket, s) {
				var adjustment = s.length - (c_ket - c_bra), left = current
						.substring(0, c_bra), right = current.substring(c_ket);
				current = left + s + right;
				this.limit += adjustment;
				if (this.cursor >= c_ket)
					this.cursor += adjustment;
				else if (this.cursor > c_bra)
					this.cursor = c_bra;
				return adjustment;
			},
			slice_check : function() {
				if (this.bra < 0 ||
				    this.bra > this.ket ||
				    this.ket > this.limit ||
				    this.limit > current.length)
				{
					throw ("faulty slice operation");
				}
			},
			slice_from : function(s) {
				this.slice_check();
				this.replace_s(this.bra, this.ket, s);
			},
			slice_del : function() {
				this.slice_from("");
			},
			insert : function(c_bra, c_ket, s) {
				var adjustment = this.replace_s(c_bra, c_ket, s);
				if (c_bra <= this.bra) this.bra += adjustment;
				if (c_bra <= this.ket) this.ket += adjustment;
			},
			slice_to : function() {
				this.slice_check();
				return current.substring(this.bra, this.ket);
			},
			get_size_of_p : function() {
				
				/* Potentially bug of ANSI C stemmers, presents here for porting compliance */
	
				return current ? encodeURIComponent(current).match(/%..|./g).length + 1 : 1;
			}
		};
	}
	var stemFactory = { 		
		

		russianStemmer : function() {

		        var a_0 = [
		            new Among ( "\u0432", -1, 1 ),
		            new Among ( "\u0438\u0432", 0, 2 ),
		            new Among ( "\u044B\u0432", 0, 2 ),
		            new Among ( "\u0432\u0448\u0438", -1, 1 ),
		            new Among ( "\u0438\u0432\u0448\u0438", 3, 2 ),
		            new Among ( "\u044B\u0432\u0448\u0438", 3, 2 ),
		            new Among ( "\u0432\u0448\u0438\u0441\u044C", -1, 1 ),
		            new Among ( "\u0438\u0432\u0448\u0438\u0441\u044C", 6, 2 ),
		            new Among ( "\u044B\u0432\u0448\u0438\u0441\u044C", 6, 2 )
		        ];
		
		        var a_1 = [
		            new Among ( "\u0435\u0435", -1, 1 ),
		            new Among ( "\u0438\u0435", -1, 1 ),
		            new Among ( "\u043E\u0435", -1, 1 ),
		            new Among ( "\u044B\u0435", -1, 1 ),
		            new Among ( "\u0438\u043C\u0438", -1, 1 ),
		            new Among ( "\u044B\u043C\u0438", -1, 1 ),
		            new Among ( "\u0435\u0439", -1, 1 ),
		            new Among ( "\u0438\u0439", -1, 1 ),
		            new Among ( "\u043E\u0439", -1, 1 ),
		            new Among ( "\u044B\u0439", -1, 1 ),
		            new Among ( "\u0435\u043C", -1, 1 ),
		            new Among ( "\u0438\u043C", -1, 1 ),
		            new Among ( "\u043E\u043C", -1, 1 ),
		            new Among ( "\u044B\u043C", -1, 1 ),
		            new Among ( "\u0435\u0433\u043E", -1, 1 ),
		            new Among ( "\u043E\u0433\u043E", -1, 1 ),
		            new Among ( "\u0435\u043C\u0443", -1, 1 ),
		            new Among ( "\u043E\u043C\u0443", -1, 1 ),
		            new Among ( "\u0438\u0445", -1, 1 ),
		            new Among ( "\u044B\u0445", -1, 1 ),
		            new Among ( "\u0435\u044E", -1, 1 ),
		            new Among ( "\u043E\u044E", -1, 1 ),
		            new Among ( "\u0443\u044E", -1, 1 ),
		            new Among ( "\u044E\u044E", -1, 1 ),
		            new Among ( "\u0430\u044F", -1, 1 ),
		            new Among ( "\u044F\u044F", -1, 1 )
		        ];
		
		        var a_2 = [
		            new Among ( "\u0435\u043C", -1, 1 ),
		            new Among ( "\u043D\u043D", -1, 1 ),
		            new Among ( "\u0432\u0448", -1, 1 ),
		            new Among ( "\u0438\u0432\u0448", 2, 2 ),
		            new Among ( "\u044B\u0432\u0448", 2, 2 ),
		            new Among ( "\u0449", -1, 1 ),
		            new Among ( "\u044E\u0449", 5, 1 ),
		            new Among ( "\u0443\u044E\u0449", 6, 2 )
		        ];
		
		        var a_3 = [
		            new Among ( "\u0441\u044C", -1, 1 ),
		            new Among ( "\u0441\u044F", -1, 1 )
		        ];
		
		        var a_4 = [
		            new Among ( "\u043B\u0430", -1, 1 ),
		            new Among ( "\u0438\u043B\u0430", 0, 2 ),
		            new Among ( "\u044B\u043B\u0430", 0, 2 ),
		            new Among ( "\u043D\u0430", -1, 1 ),
		            new Among ( "\u0435\u043D\u0430", 3, 2 ),
		            new Among ( "\u0435\u0442\u0435", -1, 1 ),
		            new Among ( "\u0438\u0442\u0435", -1, 2 ),
		            new Among ( "\u0439\u0442\u0435", -1, 1 ),
		            new Among ( "\u0435\u0439\u0442\u0435", 7, 2 ),
		            new Among ( "\u0443\u0439\u0442\u0435", 7, 2 ),
		            new Among ( "\u043B\u0438", -1, 1 ),
		            new Among ( "\u0438\u043B\u0438", 10, 2 ),
		            new Among ( "\u044B\u043B\u0438", 10, 2 ),
		            new Among ( "\u0439", -1, 1 ),
		            new Among ( "\u0435\u0439", 13, 2 ),
		            new Among ( "\u0443\u0439", 13, 2 ),
		            new Among ( "\u043B", -1, 1 ),
		            new Among ( "\u0438\u043B", 16, 2 ),
		            new Among ( "\u044B\u043B", 16, 2 ),
		            new Among ( "\u0435\u043C", -1, 1 ),
		            new Among ( "\u0438\u043C", -1, 2 ),
		            new Among ( "\u044B\u043C", -1, 2 ),
		            new Among ( "\u043D", -1, 1 ),
		            new Among ( "\u0435\u043D", 22, 2 ),
		            new Among ( "\u043B\u043E", -1, 1 ),
		            new Among ( "\u0438\u043B\u043E", 24, 2 ),
		            new Among ( "\u044B\u043B\u043E", 24, 2 ),
		            new Among ( "\u043D\u043E", -1, 1 ),
		            new Among ( "\u0435\u043D\u043E", 27, 2 ),
		            new Among ( "\u043D\u043D\u043E", 27, 1 ),
		            new Among ( "\u0435\u0442", -1, 1 ),
		            new Among ( "\u0443\u0435\u0442", 30, 2 ),
		            new Among ( "\u0438\u0442", -1, 2 ),
		            new Among ( "\u044B\u0442", -1, 2 ),
		            new Among ( "\u044E\u0442", -1, 1 ),
		            new Among ( "\u0443\u044E\u0442", 34, 2 ),
		            new Among ( "\u044F\u0442", -1, 2 ),
		            new Among ( "\u043D\u044B", -1, 1 ),
		            new Among ( "\u0435\u043D\u044B", 37, 2 ),
		            new Among ( "\u0442\u044C", -1, 1 ),
		            new Among ( "\u0438\u0442\u044C", 39, 2 ),
		            new Among ( "\u044B\u0442\u044C", 39, 2 ),
		            new Among ( "\u0435\u0448\u044C", -1, 1 ),
		            new Among ( "\u0438\u0448\u044C", -1, 2 ),
		            new Among ( "\u044E", -1, 2 ),
		            new Among ( "\u0443\u044E", 44, 2 )
		        ];
		
		        var a_5 = [
		            new Among ( "\u0430", -1, 1 ),
		            new Among ( "\u0435\u0432", -1, 1 ),
		            new Among ( "\u043E\u0432", -1, 1 ),
		            new Among ( "\u0435", -1, 1 ),
		            new Among ( "\u0438\u0435", 3, 1 ),
		            new Among ( "\u044C\u0435", 3, 1 ),
		            new Among ( "\u0438", -1, 1 ),
		            new Among ( "\u0435\u0438", 6, 1 ),
		            new Among ( "\u0438\u0438", 6, 1 ),
		            new Among ( "\u0430\u043C\u0438", 6, 1 ),
		            new Among ( "\u044F\u043C\u0438", 6, 1 ),
		            new Among ( "\u0438\u044F\u043C\u0438", 10, 1 ),
		            new Among ( "\u0439", -1, 1 ),
		            new Among ( "\u0435\u0439", 12, 1 ),
		            new Among ( "\u0438\u0435\u0439", 13, 1 ),
		            new Among ( "\u0438\u0439", 12, 1 ),
		            new Among ( "\u043E\u0439", 12, 1 ),
		            new Among ( "\u0430\u043C", -1, 1 ),
		            new Among ( "\u0435\u043C", -1, 1 ),
		            new Among ( "\u0438\u0435\u043C", 18, 1 ),
		            new Among ( "\u043E\u043C", -1, 1 ),
		            new Among ( "\u044F\u043C", -1, 1 ),
		            new Among ( "\u0438\u044F\u043C", 21, 1 ),
		            new Among ( "\u043E", -1, 1 ),
		            new Among ( "\u0443", -1, 1 ),
		            new Among ( "\u0430\u0445", -1, 1 ),
		            new Among ( "\u044F\u0445", -1, 1 ),
		            new Among ( "\u0438\u044F\u0445", 26, 1 ),
		            new Among ( "\u044B", -1, 1 ),
		            new Among ( "\u044C", -1, 1 ),
		            new Among ( "\u044E", -1, 1 ),
		            new Among ( "\u0438\u044E", 30, 1 ),
		            new Among ( "\u044C\u044E", 30, 1 ),
		            new Among ( "\u044F", -1, 1 ),
		            new Among ( "\u0438\u044F", 33, 1 ),
		            new Among ( "\u044C\u044F", 33, 1 )
		        ];
		
		        var a_6 = [
		            new Among ( "\u043E\u0441\u0442", -1, 1 ),
		            new Among ( "\u043E\u0441\u0442\u044C", -1, 1 )
		        ];
		
		        var a_7 = [
		            new Among ( "\u0435\u0439\u0448\u0435", -1, 1 ),
		            new Among ( "\u043D", -1, 2 ),
		            new Among ( "\u0435\u0439\u0448", -1, 1 ),
		            new Among ( "\u044C", -1, 3 )
		        ];
		
		        var g_v = [33, 65, 8, 232 ];
		
		        var I_p2;
		        var I_pV;
		
		        var sbp = new SnowballProgram();
		
		        function r_mark_regions() {
		            var v_1;
		            I_pV = sbp.limit;
		            I_p2 = sbp.limit;
		            v_1 = sbp.cursor;
		            lab0: do {
		                golab1: while(true)
		                {
		                    lab2: do {
		                        if (!(sbp.in_grouping(g_v, 1072, 1103)))
		                        {
		                            break lab2;
		                        }
		                        break golab1;
		                    } while (false);
		                    if (sbp.cursor >= sbp.limit)
		                    {
		                        break lab0;
		                    }
		                    sbp.cursor++;
		                }
		                I_pV = sbp.cursor;
		                golab3: while(true)
		                {
		                    lab4: do {
		                        if (!(sbp.out_grouping(g_v, 1072, 1103)))
		                        {
		                            break lab4;
		                        }
		                        break golab3;
		                    } while (false);
		                    if (sbp.cursor >= sbp.limit)
		                    {
		                        break lab0;
		                    }
		                    sbp.cursor++;
		                }
		                golab5: while(true)
		                {
		                    lab6: do {
		                        if (!(sbp.in_grouping(g_v, 1072, 1103)))
		                        {
		                            break lab6;
		                        }
		                        break golab5;
		                    } while (false);
		                    if (sbp.cursor >= sbp.limit)
		                    {
		                        break lab0;
		                    }
		                    sbp.cursor++;
		                }
		                golab7: while(true)
		                {
		                    lab8: do {
		                        if (!(sbp.out_grouping(g_v, 1072, 1103)))
		                        {
		                            break lab8;
		                        }
		                        break golab7;
		                    } while (false);
		                    if (sbp.cursor >= sbp.limit)
		                    {
		                        break lab0;
		                    }
		                    sbp.cursor++;
		                }
		                I_p2 = sbp.cursor;
		            } while (false);
		            sbp.cursor = v_1;
		            return true;
		        }
		
		        function r_R2() {
		            if (!(I_p2 <= sbp.cursor))
		            {
		                return false;
		            }
		            return true;
		        }
		
		        function r_perfective_gerund() {
		            var among_var;
		            var v_1;
		            sbp.ket = sbp.cursor;
		            among_var = sbp.find_among_b(a_0, 9);
		            if (among_var == 0)
		            {
		                return false;
		            }
		            sbp.bra = sbp.cursor;
		            switch(among_var) {
		                case 0:
		                    return false;
		                case 1:
		                    lab0: do {
		                        v_1 = sbp.limit - sbp.cursor;
		                        lab1: do {
		                            if (!(sbp.eq_s_b(1, "\u0430")))
		                            {
		                                break lab1;
		                            }
		                            break lab0;
		                        } while (false);
		                        sbp.cursor = sbp.limit - v_1;
		                        if (!(sbp.eq_s_b(1, "\u044F")))
		                        {
		                            return false;
		                        }
		                    } while (false);
		                    sbp.slice_del();
		                    break;
		                case 2:
		                    sbp.slice_del();
		                    break;
		            }
		            return true;
		        }
		
		        function r_adjective() {
		            var among_var;
		            sbp.ket = sbp.cursor;
		            among_var = sbp.find_among_b(a_1, 26);
		            if (among_var == 0)
		            {
		                return false;
		            }
		            sbp.bra = sbp.cursor;
		            switch(among_var) {
		                case 0:
		                    return false;
		                case 1:
		                    sbp.slice_del();
		                    break;
		            }
		            return true;
		        }
		
		        function r_adjectival() {
		            var among_var;
		            var v_1;
		            var v_2;
		            if (!r_adjective())
		            {
		                return false;
		            }
		            v_1 = sbp.limit - sbp.cursor;
		            lab0: do {
		                sbp.ket = sbp.cursor;
		                among_var = sbp.find_among_b(a_2, 8);
		                if (among_var == 0)
		                {
		                    sbp.cursor = sbp.limit - v_1;
		                    break lab0;
		                }
		                sbp.bra = sbp.cursor;
		                switch(among_var) {
		                    case 0:
		                        sbp.cursor = sbp.limit - v_1;
		                        break lab0;
		                    case 1:
		                        lab1: do {
		                            v_2 = sbp.limit - sbp.cursor;
		                            lab2: do {
		                                if (!(sbp.eq_s_b(1, "\u0430")))
		                                {
		                                    break lab2;
		                                }
		                                break lab1;
		                            } while (false);
		                            sbp.cursor = sbp.limit - v_2;
		                            if (!(sbp.eq_s_b(1, "\u044F")))
		                            {
		                                sbp.cursor = sbp.limit - v_1;
		                                break lab0;
		                            }
		                        } while (false);
		                        sbp.slice_del();
		                        break;
		                    case 2:
		                        sbp.slice_del();
		                        break;
		                }
		            } while (false);
		            return true;
		        }
		
		        function r_reflexive() {
		            var among_var;
		            sbp.ket = sbp.cursor;
		            among_var = sbp.find_among_b(a_3, 2);
		            if (among_var == 0)
		            {
		                return false;
		            }
		            sbp.bra = sbp.cursor;
		            switch(among_var) {
		                case 0:
		                    return false;
		                case 1:
		                    sbp.slice_del();
		                    break;
		            }
		            return true;
		        }
		
		        function r_verb() {
		            var among_var;
		            var v_1;
		            sbp.ket = sbp.cursor;
		            among_var = sbp.find_among_b(a_4, 46);
		            if (among_var == 0)
		            {
		                return false;
		            }
		            sbp.bra = sbp.cursor;
		            switch(among_var) {
		                case 0:
		                    return false;
		                case 1:
		                    lab0: do {
		                        v_1 = sbp.limit - sbp.cursor;
		                        lab1: do {
		                            if (!(sbp.eq_s_b(1, "\u0430")))
		                            {
		                                break lab1;
		                            }
		                            break lab0;
		                        } while (false);
		                        sbp.cursor = sbp.limit - v_1;
		                        if (!(sbp.eq_s_b(1, "\u044F")))
		                        {
		                            return false;
		                        }
		                    } while (false);
		                    sbp.slice_del();
		                    break;
		                case 2:
		                    sbp.slice_del();
		                    break;
		            }
		            return true;
		        }
		
		        function r_noun() {
		            var among_var;
		            sbp.ket = sbp.cursor;
		            among_var = sbp.find_among_b(a_5, 36);
		            if (among_var == 0)
		            {
		                return false;
		            }
		            sbp.bra = sbp.cursor;
		            switch(among_var) {
		                case 0:
		                    return false;
		                case 1:
		                    sbp.slice_del();
		                    break;
		            }
		            return true;
		        }
		
		        function r_derivational() {
		            var among_var;
		            sbp.ket = sbp.cursor;
		            among_var = sbp.find_among_b(a_6, 2);
		            if (among_var == 0)
		            {
		                return false;
		            }
		            sbp.bra = sbp.cursor;
		            if (!r_R2())
		            {
		                return false;
		            }
		            switch(among_var) {
		                case 0:
		                    return false;
		                case 1:
		                    sbp.slice_del();
		                    break;
		            }
		            return true;
		        }
		
		        function r_tidy_up() {
		            var among_var;
		            sbp.ket = sbp.cursor;
		            among_var = sbp.find_among_b(a_7, 4);
		            if (among_var == 0)
		            {
		                return false;
		            }
		            sbp.bra = sbp.cursor;
		            switch(among_var) {
		                case 0:
		                    return false;
		                case 1:
		                    sbp.slice_del();
		                    sbp.ket = sbp.cursor;
		                    if (!(sbp.eq_s_b(1, "\u043D")))
		                    {
		                        return false;
		                    }
		                    sbp.bra = sbp.cursor;
		                    if (!(sbp.eq_s_b(1, "\u043D")))
		                    {
		                        return false;
		                    }
		                    sbp.slice_del();
		                    break;
		                case 2:
		                    if (!(sbp.eq_s_b(1, "\u043D")))
		                    {
		                        return false;
		                    }
		                    sbp.slice_del();
		                    break;
		                case 3:
		                    sbp.slice_del();
		                    break;
		            }
		            return true;
		        }
		
		        this.stem = function() {
		            var v_1;
		            var v_2;
		            var v_3;
		            var v_4;
		            var v_5;
		            var v_6;
		            var v_7;
		            var v_8;
		            var v_9;
		            var v_10;
		            v_1 = sbp.cursor;
		            lab0: do {
		                if (!r_mark_regions())
		                {
		                    break lab0;
		                }
		            } while (false);
		            sbp.cursor = v_1;
		            sbp.limit_backward = sbp.cursor; sbp.cursor = sbp.limit;
		            v_2 = sbp.limit - sbp.cursor;
		            if (sbp.cursor < I_pV)
		            {
		                return false;
		            }
		            sbp.cursor = I_pV;
		            v_3 = sbp.limit_backward;
		            sbp.limit_backward = sbp.cursor;
		            sbp.cursor = sbp.limit - v_2;
		            v_4 = sbp.limit - sbp.cursor;
		            lab1: do {
		                lab2: do {
		                    v_5 = sbp.limit - sbp.cursor;
		                    lab3: do {
		                        if (!r_perfective_gerund())
		                        {
		                            break lab3;
		                        }
		                        break lab2;
		                    } while (false);
		                    sbp.cursor = sbp.limit - v_5;
		                    v_6 = sbp.limit - sbp.cursor;
		                    lab4: do {
		                        if (!r_reflexive())
		                        {
		                            sbp.cursor = sbp.limit - v_6;
		                            break lab4;
		                        }
		                    } while (false);
		                    lab5: do {
		                        v_7 = sbp.limit - sbp.cursor;
		                        lab6: do {
		                            if (!r_adjectival())
		                            {
		                                break lab6;
		                            }
		                            break lab5;
		                        } while (false);
		                        sbp.cursor = sbp.limit - v_7;
		                        lab7: do {
		                            if (!r_verb())
		                            {
		                                break lab7;
		                            }
		                            break lab5;
		                        } while (false);
		                        sbp.cursor = sbp.limit - v_7;
		                        if (!r_noun())
		                        {
		                            break lab1;
		                        }
		                    } while (false);
		                } while (false);
		            } while (false);
		            sbp.cursor = sbp.limit - v_4;
		            v_8 = sbp.limit - sbp.cursor;
		            lab8: do {
		                sbp.ket = sbp.cursor;
		                if (!(sbp.eq_s_b(1, "\u0438")))
		                {
		                    sbp.cursor = sbp.limit - v_8;
		                    break lab8;
		                }
		                sbp.bra = sbp.cursor;
		                sbp.slice_del();
		            } while (false);
		            v_9 = sbp.limit - sbp.cursor;
		            lab9: do {
		                if (!r_derivational())
		                {
		                    break lab9;
		                }
		            } while (false);
		            sbp.cursor = sbp.limit - v_9;
		            v_10 = sbp.limit - sbp.cursor;
		            lab10: do {
		                if (!r_tidy_up())
		                {
		                    break lab10;
		                }
		            } while (false);
		            sbp.cursor = sbp.limit - v_10;
		            sbp.limit_backward = v_3;
		            sbp.cursor = sbp.limit_backward;            return true;
		        }
		
		        this.setCurrent = function(word) {
		                sbp.setCurrent(word);
		        };
		
		        this.getCurrent = function() {
		                return sbp.getCurrent();
		        };
		},
		

	}
	var stemName = lng.toLowerCase() + "Stemmer";
	return new stemFactory[stemName]();
}

window.AdGen={
	getGetParam:function(name,url){
		if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(url ? url : location.search)){
			if(name[1])
				return decodeURIComponent(name[1]);	
			else
				return '';
		}
	},
	get:function(code, filters, keyword){
		var obj=new TextBlock(code,filters);
		if(typeof(keyword)!='string')
			keyword=window.ag_keyword;		
		return obj.rand(keyToParams(keyword ? keyword : ''));
	},
	echo:function(code, filters, keyword){
		var res=AdGen.get(code, filters, keyword);
		document.write(res);
		return res;
	},
	selectTags:function(){
		var res=[];
		var arr=document.getElementsByTagName('SCRIPT');
		if(!arr)
			return [];
		res=[];
		for(var i=0;i<arr.length;i++){
			if(arr[i].getAttribute('type')=='text/adgen')
				res.push(arr[i]);
		}
		return res;
	},
	findByQuery:function(query,el){
		if(query==='$prev'){
			var el=el.previousSibling ? el.previousSibling: el.previousElementSibling;
			while(el.nodeType===3)
				el=el.previousSibling ? el.previousSibling: el.previousElementSibling;
			return el ? [el] : []; 
		}
		if(query==='$parent'){
			return [el.parentNode];
		}
		try{
			var res=document.querySelectorAll(query);
			return res ? res : [];  
		}
		catch(e){
			if(to.indexOf(' ')!==-1 || to.indexOf(',')!==-1|| to.indexOf('.')!==-1|| to.indexOf('[')!==-1|| to.indexOf('=')!==-1 || to.indexOf(':')!==-1)
				return [];
			var res=[];
			if(to[0]==='#')
				res=[document.getElementById(query.split('#').join(''))];
			else
				res=document.getElementsByTagName(query.toUpperCase());	
			return (!res||!res[0]) ? [] : res;
		}
	},
	timeout:function(){
		if(!window.ag_keyword && !window.ag_do_if_void)
			return;
		var arr=AdGen.selectTags();
		for(var i=0;i<arr.length;i++){
			var el=arr[i];
			if(!el.getAttribute('data-maked') && ((i+1)<arr.length || el.nextSibling || el.nextElementSibling || AdGen.isLoaded)){
				var to=el.getAttribute('data-to');
				if(!to)
					continue;
				to=to.trim();
				if(!to)
					continue;
				if(!AdGen.isLoaded && to!=='title'){
					if(to[0]!=='$' && to[0]!=='#')
						continue;
					if(to.indexOf(' ')!==-1 && to.indexOf(',')!==-1)
						continue;
				}
				var selected=AdGen.findByQuery(to,el);
				
				if(selected.length===0 && !AdGen.isLoaded)
					continue;
				el.setAttribute('data-maked','1');
				var res = el.innerHTML.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').split('<![CDATA[').join(' ').split(']]>').join(' ');
				res = AdGen.get(res, el.getAttribute('data-filters'));
				for(var j=0;j<selected.length;j++)
					selected[j].innerHTML=res;
			}
		} 
		if(!AdGen.isLoaded || window.ag_dont_stop)
			window.setTimeout(function(){window.AdGen.timeout()}, 50);
	},
	normalize_external_key:function(str){
		return str.split('!').join(' ')
			.split('(').join(' ')
			.split(')').join(' ')
			.split('{').join(' ')
			.split('}').join(' ')
			.split('[').join(' ')
			.split(']').join(' ')
			.split('*').join(' ')
			.split('@').join(' ')
			.split('+').join(' ')
			.split('-').join(' ')
			.split('?').join(' ')
			.split('.').join(' ')
			.split(',').join(' ')
			.split('  ').join(' ')
			.split('  ').join(' ')
			.split('  ').join(' ')
			.trim();
	},
	gen_time_markers:function(){
		var wt=window.ag_worktime? window.ag_worktime  :{
			'mon':[8,18], //понедельник
			'tue':[8,18], //вторник
			'wed':[8,18], //среда
			'thu':[8,18], //четверг
			'fri':[8,18], //пятница
			'sat':[-1,-1], //суббота
			'sun':[-1,-1]  //воскресенье
		};
		var st=[wt['sun'][0],wt['mon'][0],wt['tue'][0],wt['wed'][0],wt['thu'][0],wt['fri'][0],wt['sat'][0]];
		var et=[wt['sun'][1],wt['mon'][1],wt['tue'][1],wt['wed'][0],wt['thu'][1],wt['fri'][1],wt['sat'][1]];
		
		var res=[];
		for(var server=0;server<2;server++){
			var prefix_ru=server ? '?c_': '?п_';
			var prefix_en=server ? '?s_': '?';
			var d = new Date();
			var time = d.getTime();
			if(server){
				var offset=window.ag_timezone_offset;
				if(!offset&& offset!==0)
					offset=3;
				time+=3600000*offset - d.getTimezoneOffset() * 60000;
			}
			d = new Date(time);
			var hour=d.getHours();
			res.push(prefix_ru+'ч'+hour,prefix_en+'h'+hour)

			if(hour >= 23||hour <= 6)
				res.push(prefix_ru+'ночь',prefix_en+'night');
			if(hour <= 17)
				res.push(prefix_ru+'день',prefix_en+'day');
			else if(hour < 22)
				res.push(prefix_ru+'вечер',prefix_en+'evening');
			
			var dow=d.getDay();
			
			if(dow===0||dow===6)
				res.push(prefix_ru+'выходной',prefix_en+'weekend');
			
			if(dow===0)
				res.push(prefix_ru+'воскресенье',prefix_en+'sunday');
			if(dow===1)
				res.push(prefix_ru+'понедельник',prefix_en+'monday');
			if(dow===2)
				res.push(prefix_ru+'вторник',prefix_en+'tuesday');
			if(dow===3)
				res.push(prefix_ru+'среда',prefix_en+'wednesday');
			if(dow===4)
				res.push(prefix_ru+'четверг',prefix_en+'thursday');
			if(dow===5)
				res.push(prefix_ru+'пятница',prefix_en+'friday');
			if(dow===6)
				res.push(prefix_ru+'суббота',prefix_en+'saturday');
			
			if(hour>=st[dow] && hour<et[dow])
				res.push(prefix_ru+'рабочее_время',prefix_en+'worktime');
		}
		return ' '+res.join(' ')+' ';
	},
	ua_find:function(needle){
		return window.navigator.userAgent.toLowerCase().indexOf(needle) !== -1;
	},
	gen_device_markers:function(){
		var res=[];
		if(AdGen.ua_find('windows'))
			res.push('?виндовс','?windows');
		else if(AdGen.ua_find('android'))
			res.push('?андроид','?android');
		else if(AdGen.ua_find('blackberry'))
			res.push('?блекберри','?blackberry');
		else if(AdGen.ua_find('iphone') || AdGen.ua_find('ipod') || AdGen.ua_find('ipad')){
			res.push('?айос','?ios');
			if(AdGen.ua_find('iphone'))
				res.push('?айфон','?iphone');
			else if(AdGen.ua_find('ipod'))
				res.push('?айпод','?ipod');
			else if(AdGen.ua_find('ipad'))
				res.push('?айпад','?ipаd');
		}
		if(AdGen.ua_find('mobile')||AdGen.ua_find('iphone')||AdGen.ua_find('ipod')||AdGen.ua_find('phone')||(AdGen.ua_find('blackberry') && !AdGen.ua_find('tablet')))
			res.push('?телефон','?phone');
		else if(AdGen.ua_find('ipad')||AdGen.ua_find('android')||AdGen.ua_find('touch')||AdGen.ua_find('blackberry'))
			res.push('?планшет','?tablet');
		else
			res.push('?десктоп','?desktop');
		
		return ' '+res.join(' ')+' ';
	},
	gen_sourche_markers:function(){
		try{
			if(!window.ag_disable_storage && 'localStorage' in window && window['localStorage']!==null && window.localStorage.getItem('ag_sourche_markers')){
				return window.localStorage.getItem('ag_sourche_markers');
			}
		}catch(e){}

		var ref=document.referrer;
		
		var sdirect = false;
		if(ref)
			ref=ref.toLowerCase();
		else{
			ref='';
			sdirect=!AdGen.getGetParam('utm_medium') && !AdGen.getGetParam('utm_source');	
		}
		var domain=document.domain.split('www.').join('').split('http://').join('').split('https://').join('');
		var inner=ref.indexOf('//'.domain)!==-1||ref.indexOf('//www.'.domain)!==-1;

		var usource   = AdGen.getGetParam('utm_source') ? AdGen.getGetParam('utm_source').toLowerCase() : '';
		var umedium   = AdGen.getGetParam('utm_medium') ? AdGen.getGetParam('utm_medium').toLowerCase() : '';

		var google    = (ref.indexOf('//google.') !== -1||ref.indexOf('//www.google.') !== -1);
		var ydirect   = (ref.indexOf('//www.yabs.yandex.') !== -1 || ref.indexOf('//www.yabs.yandex.'));
		var yandex    = (ref.indexOf('//yandex.') !== -1||ref.indexOf('//www.yandex.') !== -1||ydirect);
		var facebook  = (ref.indexOf('//facebook.') !== -1  || ref.indexOf('//www.facebook.')  !== -1 || ref.indexOf('//fb.com') !== -1 || ref.indexOf('//www.fb.com') !== -1);
		var vkontakte = (ref.indexOf('//vkontakte.') !== -1 || ref.indexOf('//www.vkontakte.') !== -1 || ref.indexOf('//vk.com') !== -1 || ref.indexOf('//www.vk.com') !== -1);
		var ymarket   = (ref.indexOf('//market.yandex.') !== -1||ref.indexOf('//www.market.yandex.') !== -1);
		
		var cpc       = umedium=='cpc'||ydirect;

		ydirect       = ydirect ||  AdGen.getGetParam('yclid') 
						|| usource==='yd'
						|| usource.indexOf('yadirect')!==-1     || usource.indexOf('ya_direct')!==-1     || usource.indexOf('ya direct')!==-1
						|| usource.indexOf('ydirect')!==-1      || usource.indexOf('y_direct')!==-1      || usource.indexOf('y direct')!==-1
						|| usource.indexOf('yandexdirect')!==-1 || usource.indexOf('yandex_direct')!==-1 || usource.indexOf('yandex direct')!==-1;
						
		var adwords = !ydirect && ((google && cpc) || usource.indexOf('adwords')!==-1)||AdGen.getGetParam('gclid');
		var email   = !google  && !yandex && !ymarket && !vkontakte && !facebook && (umedium==='email' || usource==='email'||umedium==='mail'  || usource==='mail');
		adwords = adwords && !email && !inner;
		google  = google  && !email && !inner;
		ydirect = ydirect && !email && !inner && !ymarket && !google && !adwords;
		yandex  = yandex  && !email && !inner && !ymarket && !google && !adwords;
		
		var paid = adwords || ydirect || umedium=='cpc' || umedium=='ppc';
		
		ydirect = ydirect  || (yandex && paid && !ymarket);
		adwords = adwords  || (google && paid);
		
		var other  = !sdirect && !paid && !facebook && !vkontakte && !ymarket && !yandex && !google && !email && !inner;
		var soc    = facebook || vkontakte;
		var search = google   || yandex;
		
		var res=[];
		if(email)
			res.push('?емайл' 	  , '?email');
		if(inner)
			res.push('?внутренний', '?inner');
		if(paid)
			res.push('?платный'   , '?pаid');
		if(ydirect)
			res.push('?ядирект'   , '?ydirect');
		if(adwords)
			res.push('?адвордс'   , '?adwords');
		if(google)
			res.push('?гугл'      , '?google');
		if(yandex)
			res.push('?яндекс'    , '?yandex');
		if(facebook)
			res.push('?фейсбук'   , '?facebook');
		if(vkontakte)
			res.push('?вконтакте' , '?vkontakte');
		if(ymarket)
			res.push('?ямаркет'   , '?ymarket');
		if(other)
			res.push('?рефер'     , '?refer');
		if(soc)
			res.push('?cоцсеть'   , '?social');
		if(search)
			res.push('?поиск'     , '?search');
		if(sdirect)
			res.push('?прямой'    , '?direct_visit');
		
		res=' '+res.join(' ')+' ';
		
		try{
			if(!window.ag_disable_storage && 'localStorage' in window && window['localStorage']!==null){
				window.localStorage.setItem('ag_sourche_markers',res);
			}
		}catch(e){}
		
		return res;
	}
};
//<script type="text/javascript"> 
	//<![CDATA[
	// Настройки AdGen. Должны быть перед подключением файла adgen_ru.min.js
		//Эти опции позволяют изменить текст ключевика
			//window.ag_keyword            = '';    // Текст ключа. Если пустая строка, то он определяется автоматически. Для теста можно задать какой-то 
			//window.ag_keyword_addon      = '';    // Что добавлять к тексту ключа. Например, можно добавить маркеры взависимости от ОС пользователя. К пустому ключевику не добавляется.
			//window.ag_default_keyword    = '';	// Ключевик по умолчанию, если автоматический ключевик пуст, то используется ключевик по умолчанию

		//Эти опции установлены по умолчанию в false, чтобы их изменить разкоментируйте строку 
			//window.ag_do_if_void         		= true; // Выполнять код, если ключевик пуст
			//window.ag_disable_storage    		= true; // Отключить сохранение ключа	
			//window.ag_detect_yd_query    		= true; // Поддержка запроса для Яндекс.Директ
			//window.ag_detect_by_referrer 		= true; // Иногда может поправить ошибку возникающую из-за редиректов, когда после редиректа ключ не определяется.
			//window.ag_disable_anti_xss   		= true; // Выключить защиту от XSS атак. Крайне не рекомендуется.	
			//window.ag_add_markers        		= true;
			
			//window.ag_timezone_offset    = 3;
			//window.ag_get_params_names   = [];	
			/*window.ag_worktime   		   = {
				'mon':[8,20], //понедельник
				'tue':[8,20], //вторник
				'wed':[8,20], //среда
				'thu':[8,20], //четверг
				'fri':[8,20], //пятница
				'sat':[-1,-1], //суббота
				'sun':[-1,-1]  //воскресенье
			};//*/	
	//]]>
//</script>
//<script type="text/javascript" src="http://SITE.COM/adgen_ru.min.js"></script>
	
if(!window.ag_keyword){
	window.ag_keyword=AdGen.getGetParam('_adgenkey') ? AdGen.getGetParam('_adgenkey') : '';
	try{
		if(!window.ag_keyword && document.referrer){
			var ref=document.referrer;
			if(window.ag_detect_by_referrer && AdGen.getGetParam('_adgenkey', ref))
				window.ag_keyword = AdGen.getGetParam('_adgenkey', ref);
			else if(window.ag_detect_yd_query && ref.indexOf('yandsearch')!==-1 && AdGen.getGetParam('text', ref))
				window.ag_keyword = AdGen.normalize_external_key(AdGen.getGetParam('text', ref));
			else if(window.ag_detect_yd_query && ref.indexOf('yabs.yandex')!==-1 && AdGen.getGetParam('q', ref))
				window.ag_keyword = AdGen.normalize_external_key(AdGen.getGetParam('q', ref));
		}
		if(!window.ag_keyword && window.ag_get_params_names){
			for(var agt_i=0;agt_i<window.ag_get_params_names.length;agt_i++){
				var agt_gname=window.ag_get_params_names[agt_i];
				if(agt_gname &&  AdGen.getGetParam(agt_gname)  &&  AdGen.getGetParam(agt_gname).trim()){
					window.ag_keyword = AdGen.normalize_external_key(AdGen.getGetParam(agt_gname));
					break;
				}
			}
		}
		if(!window.ag_keyword && window.ag_get_params_names && document.referrer){
			var ref=document.referrer;
			for(var agt_i=0;agt_i<window.ag_get_params_names.length;agt_i++){
				var agt_gname=window.ag_get_params_names[agt_i];
				if(agt_gname &&  AdGen.getGetParam(agt_gname,ref)  &&  AdGen.getGetParam(agt_gname,ref).trim()){
					window.ag_keyword = AdGen.normalize_external_key(AdGen.getGetParam(agt_gname,ref));
					break;
				}
			}
		}
		if(!window.ag_disable_storage && 'localStorage' in window && window['localStorage']!==null){
			if(window.ag_keyword)
				window.localStorage.setItem('ag_keyword',window.ag_keyword);
			else if(window.localStorage.getItem('ag_keyword'))
				window.ag_keyword=window.localStorage.getItem('ag_keyword');
		}
	}catch(e){}
	
	if(window.ag_keyword && window.ag_keyword_addon)
		window.ag_keyword+=' '+window.ag_keyword_addon;
	else if(window.ag_keyword_addon && window.ag_add_to_void)
		window.ag_keyword = window.ag_keyword_addon;	
	window.ag_keyword=window.ag_keyword ? window.ag_keyword : window.ag_default_keyword;
	window.ag_keyword=window.ag_keyword ? window.ag_keyword : '';	
	
	if(window.ag_keyword || window.ag_do_if_void){
		if(window.ag_add_markers){
			window.ag_keyword+=AdGen.gen_time_markers();
			window.ag_keyword+=AdGen.gen_device_markers();
			window.ag_keyword+=AdGen.gen_sourche_markers();
		}
	}
}
AdGen.prevOnload=window.onload;
AdGen.isLoaded=false;
window.onload=function(e){
	AdGen.isLoaded=true;
	window.setTimeout(function(){
		AdGen.timeout();
	},50)
	if(AdGen.prevOnload)
		AdGen.prevOnload(e);
}

//Простой текст
	function SimpleText(str){
		this.str=str;
		this._static=true;
		this._isVoid=(str==='');
	};
	SimpleText.prototype={
		blockType:'simple',

		//СЛУЧАЙНЫЙ ВАРИАНТ
		rand:function(params){
			return this.str;
		},
		//ВАРИАНТ С НОМЕРОМ
		get:function(num,params){
			return this.str;
		},
		count:function(params){
			return 1;
		},
	

	};
	window.VoidSimpleText=new SimpleText('');
	window.NeverSimpleText=new SimpleText('asdassduivvjasdycyzxj');
	window.NeverSimpleText._isNever=true;
	window.NoneSimpleText=new SimpleText('');
	window.NoneSimpleText._isNone=true;
	
	//Оптимизация по скорости
	function _newTextBlock(str){
		var res = new TextBlock(str);
	

		return res;
	}
	
//Текстовый блок 
	function TextBlock(items,filters){
		if(typeof(filters)=='string')
			filters=filters.split(',').join(' ').split(' ');
		if(filters instanceof Array){
			var tmp={};
			for(var i=0; i<filters.length; i++){
				if(filters[i])
					tmp[filters[i]]=true;
			}
			filters=tmp;
		}
		this.filters=filters;
		
		if(typeof(items)=='string')
			items=TextBlock.prototype.parse(this.applyFilters(items, true ,true));
		var arr=[];
		var wasNotVoid=false;
		for(var i=0;i<items.length;i++){
			if(!items[i]._isVoid){
				wasNotVoid=true;
				arr.push(items[i]);
			}
		}
		if(!wasNotVoid){
			arr.push(window.VoidSimpleText);
			this._isVoid=true;
		}
		
		this.arr=arr;
		
		this._count=false;
		this._static=true;
		for(var i=0;i<arr.length;i++){
			if(!arr[i]._static){
				this._static=false;
				break;
			}
		}
	};
	TextBlock.prototype={
		blockType:'text',
	


		get:function(num,params){
			var len=this.arr.length;
			if(len===0)
				return '';
		

			var nums=[];
			for(var i=0; i<len; i++)
				nums.push(0);
			var len=this.arr.length;
			for(var i=len-1; i>=0; i--){
				var count=this.arr[i].count(params);
				var ost=num%count;
				nums[i]=ost;
				num=Math.round((num-ost)/count);
			}
			var res=this.arr[0].get(nums[0],params);
			for(var i=1; i<len; i++)
				res+=this.arr[i].get(nums[i],params);
			return this.applyFilters(res);
		},
		applyFilters:function(str,noUC, isPrepare){
			if(this.filters){
				if(this.filters.only_space)
					str=str.replace(/\s/g, ' ');
				if(this.filters.trim)
					str=str.trim();
				if(this.filters.no_space)
					str=str.replace(/  +/g, '');
				if(this.filters.one_space)
					str=str.replace(/  +/g, ' ');
				if(this.filters.uc_first && !noUC)
					str=str.charAt(0).toUpperCase() + str.substr(1, str.length-1);
				if(this.filters.fix_punct){	
					str=str
						.split(' ,').join(',').split(',').join(', ')
						.split(' .').join('.')
						.split('  ').join(' ').trim();

					if(!isPrepare){	
						str=str.split(' ?').join('?').split('?').join('? ')
							   .split(' !').join('!').split('!').join('! ');
					}
					
					if(!noUC){
						str=str.split('. ').join('<*eol>. ').split('? ').join('<*eol>? ').split('! ').join('<*eol>! ').split('<*eol>');
						for(var i=1;i<str.length;i++){
							if(str[i].length==2)
								continue;
								
							if(str[i].length===3)
								str[i]=str[i].charAt(0)+ str[i].charAt(1)+str[i].charAt(2).toUpperCase();
							else
								str[i]=str[i].charAt(0)+ str[i].charAt(1)+str[i].charAt(2).toUpperCase() + str[i].substr(3, str[i].length-1);					
						}
						str=str.join('');
					}
				}
			}
			return str;
		},
	
	
		count:function(params){
			if(this._static && this._count!==false)
				return this._count;
			this._count=1;
			for(var i=0; i<this.arr.length; i++)
				this._count*=this.arr[i].count(params);
			return this._count;
		},
		rand:function(params){
			
	

			var len=this.arr.length;
			if(len===0)
				return '';
				
			var res=this.arr[0].rand(params);
			for(var i=1; i<this.arr.length; i++)
				res+=this.arr[i].rand(params);
			return this.applyFilters(res);
		},
	

		parse: function(str){
			var level=0;
			var arr=[];
			var pos=0;//последний неучтенный символ
			var L0=false;
			for(var i=0; i<str.length + 1; i++){
				if(i===str.length){
					if(pos<i)
						arr.push(new SimpleText(str.substr(pos)));
				}
				else if((str[i]==='*' || str[i]==='@' || str[i]==='<' || str[i]==='>') && i+1<str.length && str[i+1]==='{'){
					if(level===0){
						if(pos<i)
							arr.push(new SimpleText(str.substring(pos,i)));
						pos=i+2;
						if(str[i]==='*')		
							L0='gen';
						else if(str[i]==='@')
							L0='query';
						else if(str[i]==='<')		
							L0='var_out';
						else if(str[i]==='>')		
							L0='var_in';
					}
				}
				else if(str[i]==='{')
					level++;
				else if(str[i]==='}'){
					level--;
					if(level===0 && L0){
						if(pos<i){
							if(L0==='gen')
								arr.push(new GenBlock(str.substring(pos,i)));
							else if(L0==='query')
								arr.push(new QueryBlock(str.substring(pos,i)));
							else if(L0==='var_out')
								arr.push(new VarBlock(true,str.substring(pos,i)));
							else if(L0==='var_in')
								arr.push(new VarBlock(false,str.substring(pos,i)));
						}
						pos=i+1;
						L0=false;
					}
				}
			}
			return arr;
		}
		
	};
//Блок Переменной	
	function VarBlock(out,varname,oper,val){
		this.out      = out;
		varname=varname.trim();
		if(varname.indexOf('=')!==-1){
			var res=VarBlock.prototype.parse(varname);
			varname=res.varname;
			oper=res.oper;
			val=res.val;
		}
		this.varname  = varname;
		this.oper     = oper;
		this.val      = val  ? val : window.VoidSimpleText;
		this._static  = false;
	}; 
	VarBlock.prototype={
		blockType:'var',
		get:function(num,params){
			if(!params.vars)
				params.vars={};
			var out;
			if(this.oper==='set'||this.oper==='add'){
				out=this.val.get(num,params);
				if(this.oper==='set' || typeof(params.vars[this.varname])=='undefined')
					params.vars[this.varname]=out;
				else
					params.vars[this.varname]+=out;
			}
			else
				out=params.vars[this.varname];
			return (!this.out || typeof(out)=='undefined') ? '' : out;
		},
		count:function(params){
			return this.val.count();
		},
		rand:function(params){
			var len=this.count();
			return this.get(Math.min(len-1, Math.floor(len * Math.random())),params);
		},
	
		
		parse:function(str){
			var level=0;
			var pos=0;//последний неучтенный символ

			var varname='';
			var oper=false;
			var val=false;
			
			for(var i=0; i<str.length + 1; i++){
				if(i===str.length){
					if(pos<=i){
						if(oper)
							val=_newTextBlock(str.substr(pos));
						else
							varname=str.substr(pos).trim();
					}
				}
				else if(str[i]==='{')
					level++;
				else if(str[i]==='}')
					level--;
				else if(str[i]==='=' && level===0){
					if(str[i-1]==='+'){
						oper='add';
						varname=str.substring(0,i-1).trim();
					}
					else{ 
						oper='set';
						varname=str.substring(0,i).trim();
					}
					pos=i+1;
				}
			}
			return {
				varname:varname,
				oper:oper,
				val:val
			};
		}
	};
	
//Блок генератора	
	function GenBlock(arr){
		if(typeof(arr)=='string')
			arr=GenBlock.prototype.parse(arr);
		this.arr=arr;
		
		this._count=false;
		this._static=true;
		for(var i=0;i<arr.length;i++){
			if(!arr[i]._static){
				this._static=false;
				break;
			}
		}
	};
	GenBlock.prototype={
		blockType:'gen',
	

		get:function(num,params){
			if(this._optimized)
				return this.arr[num].str;
				
			var len=this.arr.length;
			for(var i=0; i<len; i++){
				var count=this.arr[i].count(params);
				if(num<count)
					return this.arr[i].get(num,params);
				else
					num-=count;
			}
			return '';
		},
	
	
		count:function(params){
			if(this._static && this._count!==false)
				return this._count;
			this._count=0;
			for(var i=0; i<this.arr.length; i++)
				this._count+=this.arr[i].count(params);
			return this._count;
		},
		rand:function(params){
			

				return this.arr[Math.min(this.arr.length-1, Math.floor(this.arr.length * Math.random()))].rand(params);
		},


		parse:function(str){
			var level=0;
			var arr=[];
			var pos=0;//последний неучтенный символ
			for(var i=0; i<str.length + 1; i++){
				if(i===str.length){
					if(pos<=i)
						arr.push(_newTextBlock(str.substr(pos)));
				}
				else if(str[i]==='{')
					level++;
				else if(str[i]==='}')
					level--;
				else if(str[i]==='|' && level===0){
					if(pos<=i)
						arr.push(_newTextBlock(str.substring(pos,i)));
					pos=i+1;
				}
			}
			return arr;
		}
	};
	
//Блок выбора по ключевому слову		
	function QueryBlock(arr){
		if(typeof(arr)=='string')
			arr=QueryBlock.prototype.parse(arr);
		this.arr=arr;
		this._static=false;
		
		this._lastKey=false;
		this._lastFind=false;
		this._hasVar=false;
		for(var i in arr) if(arr.hasOwnProperty(i)){
			if(arr[i]._hasVar){
				this._hasVar=true;
				break;
			}
		}
	};
	QueryBlock.prototype={
		blockType:'query',
	
			
		find:function(params){
		
			
			for(var i=0; i<this.arr.length; i++){
				if(this.arr[i].check(params)){
				
			
					return this.arr[i];
				}
			}
			
			
			return window.VoidQueryItem;
		},
		rand:function(params){
			return this.find(params).rand(params);
		},
	
			
		get:function(num,params){
			return this.find(params).get(num,params);
		},
		count:function(params){
			if(!params)
				params={};
			
			
				
			var res= this.find(params).count(params);

			
			

			return res;
		},
		parse:function(str){
			var level=0;
			var arr=[];
			var pos=0;//последний неучтенный символ
			for(var i=0; i<str.length + 1; i++){
				if(i===str.length){
					if(pos<=i)
						arr.push(new QueryItem(str.substr(pos)));
				}
				else if(str[i]==='{')
					level++;
				else if(str[i]==='}')
					level--;	
				else if(str[i]==='|' && level===0){
					if(pos<=i)
						arr.push(new QueryItem(str.substring(pos,i)));
					pos=i+1;
				}	
			}
			return arr;
		}
	};
//Элемент блока выбора по ключу 
	function QueryItem(sel,val, hasVar){
		if(typeof(sel)=='string'){
			var arr = QueryItem.prototype.parse(sel);
			sel 	= arr[0];
			val 	= arr[1];
			hasVar  = arr[2];
		}
		this.sel    = sel ? sel : _newTextBlock('');
		this.val    = val ? val : _newTextBlock('');
		this._hasVar = hasVar;
		
		this._lastKey=false;
		this._lastCheck=false;
	};
	QueryItem.prototype={
		blockType:'queryItem',
	
			

		getVal:function(params){
			if(!this.val._isNone)
				return this.val;
			var tmp=this.sel.get(this.check(params) - 1,params).split(' ');
			var arr=[];
			for(var i=0;i<tmp.length;i++){
				var cur=tmp[i];
				if(cur.indexOf('?')===-1 && cur.indexOf('$')===-1 && cur.indexOf('-')===-1)
					arr.push(cur.split('!').join(''));
			}
			return new SimpleText(arr.join(' '));
		},
		count:function(params){
			return this.val.count(params);
		},
		rand:function(params){
			return this.getVal(params).rand(params);
		},
		get:function(num,params){
			return this.getVal(params).get(num,params);
		},
	
			
		check:function(params, noVars){
			if(this.sel._isVoid)
				return true;
			if(this.sel._isNever)
				return false;
		
			
			
			var num=this.sel.count(params);
			for(var i=0;i<num;i++){
				var words=' '+this.sel.get(i,params);
				//words=words.split(' ? ').join(' ?');
				//words=words.split(' ! ').join(' !');
				//words=words.split(' -? ').join(' -?');
				//words=words.split(' -! ').join(' -!');
				
				words=words.trim().split(' ');
				var good=true;
				for(var j=0;j<words.length;j++){
					var word=words[j].trim();
					if(word.length===0 || word==='-')
						continue;
						
					if(word[0]==='$'||word[1]==='$'){
						if(!noVars)
							continue;
						var nead = true; 
						if(word[0]==='-'){
							nead = false; 
							word=word.substring(1,word.length-1);
						}
						word=word.substring(1,word.length-1);
						var get  = (params.vars[word] && params.vars[word].trim()!=='');
						if(get!=nead){
							good=false;
							break;
						}
					}
					else if(word[0]==='?' || word[0]==='!'){
						if(!params._keyIndex[word]){
							good=false;
							break;
						}
					}
					else if(word[0]==='-' && (word[1]==='?'||word[1]==='!')){
						if(params._keyIndex[word]){
							good=false;
							break;
						}
					}
					else if(word[0]==='-'){
						var wt=word.substring(1,word.length-1);
						if(params._keyIndex['!'+wt] || params._keyIndex[ag_stem(wt)]){
							good=false;
							break;
						}
					}
					else{
						if(!params._keyIndex['!'+word] && !params._keyIndex[ag_stem(word)]){
							good=false;
							break;
						}
					}
				}
				if(good){
					this._lastCheck=true;
					return i+1;
				}
			}
			this._lastCheck=false;
			return false;
		},
		parse:function(str){
			var level=0;
			var arr=[];
			var hasVar=false;
			var pos=0;//последний неучтенный символ
			for(var i=0; i<str.length + 1; i++){
				if(i===str.length){
					if(pos<=i)
						arr.push(_newTextBlock(str.substr(pos)));
				}
				else if(str[i]==='{')
					level++;
				else if(str[i]==='}')
					level--;	
				else if(str[i]==='=' && str.length>i+1 &&  str[i+1]==='>' && level===0 && arr.length===0){
					if(pos<=i){
						var sel=str.substring(pos,i).substr(pos).toLowerCase().replace(/\s/g, ' ').replace(/  +/g, ' ').trim();
						if(sel.indexOf('$')!==-1)
							hasVar=true;
						arr.push(_newTextBlock(sel));
					}
					//else
					//	arr.push(_newTextBlock(''));
					pos=i+2;
				}	
			}
			if(arr.length===1)
				arr.push(window.NoneSimpleText);
			arr.push(hasVar);
			return arr;
		}
	};
	window.VoidQueryItem=new QueryItem('=>');
	/*
	alert((_newTextBlock('@{мир*{а|}=>был мир|=>мира не было*{|!}}')).rand({
		_keyCS:'ased1221',
		_keyIndex:{
			'привет':1,
			'мира':1
		},
	}));
	*/
	function cloneVars(obj){
		if(!obj)
			return {};
		var res={};
		for(var i in obj) if(obj.hasOwnProperty(i))
			res[i]=obj[i];
		return res;
	}
	window.ag_stemmer = new ag_Snowball('russian');
	window.ag_stemCash={};
	window.ag_stemCashTmp={}
	window.ag_stemCashCount=0;

	function ag_stem(word){
		word=word.toLowerCase().split('ё').join('е');
		if(window.ag_stemCash[word])
			return window.ag_stemCash[word];
		window.ag_stemmer.setCurrent(word);
		window.ag_stemmer.stem(); 
		var res= window.ag_stemmer.getCurrent();

		if(window.ag_stemCashCount>10000){
			window.ag_stemCashCount=0;
			window.ag_stemCash=ag_clone_obj(window.ag_stemCashTmp);
		}
		window.ag_stemCash[word]=res;

		return res;
	}
	window.ag_stemCashTmp={
		'недорого':ag_stem('недорогие'),
		'дорого':ag_stem('дорогие'),
		'куплю':ag_stem('купить'),
	};
	window.ag_stemCash=ag_clone_obj(window.ag_stemCashTmp);
	function ag_clone_obj(obj){
		var res={};
		for(var x in obj) if(obj.hasOwnProperty(x))
			res[x]=obj[x];
		return res;
	}
	function keyToParams(key){
		//число слов
		var params={};
		params._keyCS=key;
		key=key.split('!').join(' ');
		
		var tmp=splitKeyToVars(key, true);
		key=tmp.key;
		params.vars=tmp.vars
		
		var tmp=key;
		key=key.split('[').join(' ').split(']').join(' ');
		var extract=(key!==tmp);

		tmp=key;
		key=key.split('"').join(' ');
		var phrase=!extract && (key!==tmp);
		
		
		tmp=key;
		key=key.split('+').join(' ')
		var modifikator=!extract && !phrase && (key!==tmp);
		
		key=key.split('!').join(' ');
		params._keyIndex={};
		var arr=key.toLowerCase().split(' ');
		for(var i in arr) if(arr.hasOwnProperty(i) && arr[i].trim()!==''){
			var cur=arr[i].trim();
			if(cur.indexOf('?')!==-1){
				params._keyIndex[cur]=true;
				params._keyIndex['-'+cur]=true;
			}
			else{
				params._keyIndex['!'+cur]=true;
				params._keyIndex['-!'+cur]=true;
				var st=ag_stem(cur);
				params._keyIndex[st]=true;
				params._keyIndex['-'+st]=true;
			}
		}
		if(extract){
			params._keyIndex['?точное']=true;
			params._keyIndex['-?точное']=true;
		}
		else if(phrase){
			params._keyIndex['?фразовое']=true;
			params._keyIndex['-?фразовое']=true;
		}
		else if(modifikator){
			params._keyIndex['?модификатор']=true;
			params._keyIndex['-?модификатор']=true;
		}		
		return params; 	
	}
	function splitKeyToVars(key, fromKeyToParams){
		var arr=key.split('>{');
		var vars={};
		for(var i=1;i<arr.length;i++){
			var tmp=arr[i].split('}')[0].split('=');
			if(arr[i].split('}').length>1)
				arr[i]=arr[i].split('}')[1];
			else
				arr[i]='';
			var val=[];
			for(var j=1;j<tmp.length;j++)
				val.push(tmp[j]);
			val=val.join('=');
			if(!window.ag_disable_anti_xss && fromKeyToParams)
				val=val.split('<').join('&lt;').split('>').join('&gt;');
			vars[tmp[0]]=val;
		}
		key=arr.join(' ').trim();
		return {key:key,vars:vars}
	}
		
			

window.AdGen.timeout();