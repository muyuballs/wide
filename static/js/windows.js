/* 
 * Copyright (c) 2014, B3log
 *  
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0
 *  
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ 

var windows = {
    isMaxEditor: false,
    init: function () {
        $(".footer .ico-restore:eq(1)").click(function () {
            windows.restoreBottom();
            if ($(".footer .ico-restore:eq(0)").css("display") === "none") {
                $(".toolbars .ico-restore").removeClass("ico-restore").addClass("ico-max")
                        .attr({
                            "title": config.label.max_editor,
                            "onclick": "windows.maxEditor()"
                        });
            }
        });

        $(".bottom-window-group .ico-min").click(function () {
            windows.minBottom();
            if ($(".footer .ico-restore:eq(0)").css("display") === "inline") {
                $(".toolbars .ico-max").removeClass("ico-max").addClass("ico-restore")
                        .attr({
                            "title": config.label.restore_editor,
                            "onclick": "windows.restoreEditor()"
                        });
            }
        });

        $(".bottom-window-group .tabs").dblclick(function () {
            windows.maxBottom();
        });

        $(".footer .ico-restore:eq(0)").click(function () {
            windows.restoreSide();
            if ($(".footer .ico-restore:eq(1)").css("display") === "none") {
                $(".toolbars .ico-restore").removeClass("ico-restore").addClass("ico-max")
                        .attr({
                            "title": config.label.max_editor,
                            "onclick": "windows.maxEditor()"
                        });
            }
        });

        $(".side .ico-min").click(function () {
            windows.minSide();
            if ($(".footer .ico-restore:eq(1)").css("display") === "inline") {
                $(".toolbars .ico-max").removeClass("ico-max").addClass("ico-restore")
                        .attr({
                            "title": config.label.restore_editor,
                            "onclick": "windows.restoreEditor()"
                        });
            }
        });

        $(".side .tabs").dblclick(function () {
            windows.maxSide();
        });

        $(window).click(function (event) {
            if ($(event.target).closest(".footer").length === 1
                    || $(event.target).closest(".bottom-window-group").length === 1
                    || $(event.target).closest(".toolbars").length === 1
                    || $(event.target).closest(".side").length === 1) {
                return false;
            }

            windows.clearFloat();
        });
    },
    maxBottom: function () {
        var $it = $(".bottom-window-group");

        if ($it.hasClass("bottom-window-group-max")) {
            windows.restoreBottom();
            if ($(".side").css("left") !== "0px" && $(".side").css("left") !== "auto") {
                $it.css({
                    "left": "0px",
                    "width": "100%"
                });
            }
        } else {
            $it.attr("style", "");

            var bottomH = $(".content").height();
            $(".bottom-window-group > .tabs-panel > div > div").height(bottomH - $it.children(".tabs").height());

            $it.addClass("bottom-window-group-max");
        }
    },
    maxSide: function () {
        var $it = $(".side");
        if ($it.hasClass("side-max")) {
            windows.restoreSide();
        } else {
            $it.addClass("side-max");
        }
    },
    restoreBottom: function () {
        var $it = $(".bottom-window-group");
        $it.removeClass("bottom-window-group-max").attr("style", "");
        var bottomH = $it.height();

        $(".bottom-window-group > .tabs-panel > div > div").height(bottomH - $it.children(".tabs").height());

        $it.animate({
            "top": "70%"
        }, function () {
            $(".edit-panel").css("height", "70%");

            var editorDatas = editors.data,
                    height = $(".edit-panel").height() - $(".edit-panel .tabs").height();
            for (var i = 0, ii = editorDatas.length; i < ii; i++) {
                editorDatas[i].editor.setSize("100%", height);
            }

            $it.show();
            $(".footer .ico-restore:eq(1)").hide();
        });

        if ($(".footer .ico-restore:eq(0)").css("display") === "inline") {
            // 当文件树最小化时
            $it.css({
                "width": "100%",
                "left": "0"
            });
        }
    },
    restoreSide: function () {
        $(".side").animate({
            "left": "0"
        }, function () {
            $(".edit-panel, .bottom-window-group").css({
                "left": "20%",
                "width": "80%"
            });

            $(".footer .ico-restore:eq(0)").hide();
        }).removeClass("side-max");
    },
    minBottom: function () {
        $(".edit-panel").css("height", "100%");

        var editorDatas = editors.data,
                height = $(".content").height() - $(".edit-panel .tabs").height();
        for (var i = 0, ii = editorDatas.length; i < ii; i++) {
            editorDatas[i].editor.setSize("100%", height);
        }

        $(".bottom-window-group").css("top", "100%").hide();
        $(".footer .ico-restore:eq(1)").show();
    },
    minSide: function () {
        $(".side").css("left", "-20%").removeClass("side-max");

        $(".edit-panel, .bottom-window-group").css({
            "left": "0",
            "width": "100%"
        });
        $(".footer .ico-restore:eq(0)").show();
    },
    maxEditor: function () {
        $(".toolbars .ico-max").removeClass("ico-max").addClass("ico-restore")
                .attr({
                    "title": config.label.restore_editor,
                    "onclick": "windows.restoreEditor()"
                });

        windows.minBottom();
        windows.minSide();
        if (wide.curEditor) {
            wide.curEditor.focus();
        }

        windows.isMaxEditor = true;
    },
    restoreEditor: function () {
        $(".toolbars .ico-restore").removeClass("ico-restore").addClass("ico-max")
                .attr({
                    "title": config.label.max_editor,
                    "onclick": "windows.maxEditor()"
                });

        windows.restoreBottom();
        windows.restoreSide();
        if (wide.curEditor) {
            wide.curEditor.focus();
        }

        windows.isMaxEditor = false;
    },
    clearFloat: function () {
        if ($(".footer .ico-restore:eq(0)").css("display") === "inline") {
            // 当文件树最小化时
            windows.minSide();
        }

        if ($(".footer .ico-restore:eq(1)").css("display") === "inline") {
            // 当底部最小化时
            windows.minBottom();
        }
    },
    flowBottom: function () {
        if ($(".footer .ico-restore:eq(1)").css("display") === "inline") {
            // 当底部树最小化时
            $(".bottom-window-group").css({
                "top": "70%",
                "left": "0px",
                "width": "100%",
                "z-index": "8"
            }).show();

            if ($(".footer .ico-restore:eq(0)").css("display") === "inline") {
                // 当文件最小化时
                $(".side").css("left", "-20%");
            }
        }
    }
};