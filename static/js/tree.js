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

var tree = {
    fileTree: undefined,
    // 递归获取当前节点展开中的最后一个节点
    getCurrentNodeLastNode: function (node) {
        var returnNode = node.children[node.children.length - 1];
        if (returnNode.open) {
            return tree.getCurrentNodeLastNode(returnNode);
        } else {
            return returnNode;
        }
    },
    // 按照树展现获取下一个节点
    getNextShowNode: function (node) {
        if (node.level !== 0) {
            if (node.getParentNode().getNextNode()) {
                return node.getParentNode().getNextNode();
            } else {
                return tree.getNextShowNode(node.getParentNode());
            }
        } else {
            return node.getNextNode();
        }
    },
    isBottomNode: function (node) {
        if (node.open) {
            return false;
        }

        if (node.getParentNode()) {
            if (node.getParentNode().isLastNode) {
                return tree.isBottomNode(node.getParentNode());
            } else {
                return false;
            }
        } else {
            if (node.isLastNode) {
                return true;
            } else {
                return false;
            }
        }
    },
    getTIdByPath: function (path) {
        var nodes = tree.fileTree.transformToArray(tree.fileTree.getNodes());
        for (var i = 0, ii = nodes.length; i < ii; i++) {
            if (nodes[i].path === path) {
                return nodes[i].tId;
            }
        }

        return undefined;
    },
    getOpenPaths: function () {
        var nodes = tree.fileTree.transformToArray(tree.fileTree.getNodes()),
                paths = [];
        for (var i = 0, ii = nodes.length; i < ii; i++) {
            if (nodes[i].open) {
                paths.push(nodes[i].path);
            }
        }

        return paths;
    },
    getAllParents: function (node, parents) {
        if (!parents) {
            parents = [];
        }

        if (!node || !node.parentTId) {
            return parents;
        } else {
            parents.push(node.getParentNode());
            return tree.getAllParents(node.getParentNode(), parents);
        }
    },
    isParents: function (tId, parentTId) {
        var node = tree.fileTree.getNodeByTId(tId);
        if (!node || !node.parentTId) {
            return false;
        } else {
            if (node.parentTId === parentTId) {
                return true;
            } else {
                return tree.isParents(node.parentTId, parentTId);
            }
        }
    },
    isDir: function () {
        if (wide.curNode.iconSkin.indexOf("ico-ztree-dir") === 0) {
            return true;
        }
        return false;
    },
    newFile: function (it) {
        if ($(it).hasClass("disabled")) {
            return false;
        }

        $("#dirRMenu").hide();
        $("#dialogNewFilePrompt").dialog("open");
    },
    newDir: function (it) {
        if ($(it).hasClass("disabled")) {
            return false;
        }

        $("#dirRMenu").hide();
        $("#dialogNewDirPrompt").dialog("open");
    },
    removeIt: function (it) {
        if (it) {
            if ($(it).hasClass("disabled")) {
                return false;
            }
        } else {
            // 直接调用时，如果为 api 及其子目录或者 workspace 则不能进行删除
            if (!wide.curNode.removable) {
                return false;
            }
        }

        $("#dirRMenu").hide();
        $("#fileRMenu").hide();
        $("#dialogRemoveConfirm").dialog("open");
    },
    rename: function (it) {
        if (it) {
            if ($(it).hasClass("disabled")) {
                return false;
            }
        }

        $("#dirRMenu").hide();
        $("#fileRMenu").hide();
        $("#dialogRenamePrompt").dialog("open");
    },
    export: function (it) {
        if (it) {
            if ($(it).hasClass("disabled")) {
                return false;
            }
        }

        var request = newWideRequest();
        request.path = wide.curNode.path;

        $.ajax({
            type: 'POST',
            url: '/file/zip/new',
            data: JSON.stringify(request),
            dataType: "json",
            success: function (data) {
                if (!data.succ) {
                    $("#dialogAlert").dialog("open", data.msg);

                    return false;
                }

                window.open('/file/zip?path=' + wide.curNode.path + '.zip');
            }
        });

        $("#dirRMenu").hide();
        $("#fileRMenu").hide();
    },
    refresh: function (it) {
        if (it) {
            if ($(it).hasClass("disabled")) {
                return false;
            }
        }

        tree.fileTree.reAsyncChildNodes(wide.curNode, "refresh");

        $("#dirRMenu").hide();
        $("#fileRMenu").hide();
    },
    import: function (it) {
        if (it) {
            if ($(it).hasClass("disabled")) {
                return false;
            }
        }

        var request = newWideRequest();
        request.path = wide.curNode.path;

        $('#importFileupload').fileupload({
            url: "/file/upload?path=" + request.path,
            dataType: 'json',
            formData: request,
            done: function (e, data) {
                tree.fileTree.reAsyncChildNodes(wide.curNode, "refresh");
            }
        });

        $("#dirRMenu").hide();
        $("#fileRMenu").hide();
    },
    init: function () {
        $("#file").click(function () {
            $(this).focus();
        });

        var request = newWideRequest();

        $.ajax({
            type: 'POST',
            url: '/files',
            data: JSON.stringify(request),
            dataType: "json",
            success: function (data) {
                if (data.succ) {
                    var dirRMenu = $("#dirRMenu");
                    var fileRMenu = $("#fileRMenu");
                    var setting = {
                        data: {
                            key: {
                                title: "path"
                            }
                        },
                        view: {
                            showTitle: true,
                            selectedMulti: false
                        },
                        async: {
                            enable: true,
                            url: "/file/refresh",
                            autoParam: ["path"]
                        },
                        callback: {
                            onDblClick: function (event, treeId, treeNode) {
                                if (treeNode) {
                                    tree.openFile(treeNode);
                                }
                            },
                            onRightClick: function (event, treeId, treeNode) {
                                if (treeNode) {
                                    wide.curNode = treeNode;
                                    tree.fileTree.selectNode(treeNode);

                                    if (!tree.isDir()) { // 如果右击了文件
                                        if (wide.curNode.removable) {
                                            $("#fileRMenu .remove").removeClass("disabled");
                                        } else {
                                            $("#fileRMenu .remove").addClass("disabled");
                                        }

                                        $("#fileRMenu").show();

                                        fileRMenu.css({
                                            "top": event.clientY - 10 + "px",
                                            "left": event.clientX + "px",
                                            "display": "block"
                                        });
                                    } else { // 右击了目录
                                        if (wide.curNode.removable) {
                                            $("#dirRMenu .remove, #dirRMenu .rename").removeClass("disabled");
                                        } else {
                                            $("#dirRMenu .remove, #dirRMenu .rename").addClass("disabled");
                                        }

                                        if (wide.curNode.creatable) {
                                            $("#dirRMenu .create").removeClass("disabled");
                                        } else {
                                            $("#dirRMenu .create").addClass("disabled");
                                        }

                                        $("#dirRMenu").show();
                                        dirRMenu.css({
                                            "top": event.clientY - 10 + "px",
                                            "left": event.clientX + "px",
                                            "display": "block"
                                        });
                                    }
                                    $("#files").focus();
                                }
                            },
                            onClick: function (event, treeId, treeNode, clickFlag) {
                                if (treeNode) {
                                    wide.curNode = treeNode;
                                    tree.fileTree.selectNode(treeNode);
                                    $("#files").focus();
                                }
                            }
                        }
                    };
                    tree.fileTree = $.fn.zTree.init($("#files"), setting, data.root.children);

                    session.restore();
                }
            }
        });

        this._initSearch();
    },
    openFile: function (treeNode, cursor) {
        wide.curNode = treeNode;
        var tempCursor = cursor;

        for (var i = 0, ii = editors.data.length; i < ii; i++) {
            // 该节点文件已经打开
            if (editors.data[i].id === treeNode.tId) {
                editors.tabs.setCurrent(treeNode.tId);
                wide.curEditor = editors.data[i].editor;

                if (!tempCursor) {
                    tempCursor = wide.curEditor.getCursor();
                }
                $(".footer .cursor").text('|   ' + (tempCursor.line + 1) + ':' + (tempCursor.ch + 1) + '   |');

                wide.curEditor.setCursor(tempCursor);
                var half = Math.floor(wide.curEditor.getScrollInfo().clientHeight / wide.curEditor.defaultTextHeight() / 2);
                var cursorCoords = wide.curEditor.cursorCoords({line: tempCursor.line - half, ch: 0}, "local");
                wide.curEditor.scrollTo(0, cursorCoords.top);
                wide.curEditor.focus();

                return false;
            }
        }

        if (!tree.isDir()) { // 如果单击了文件
            var request = newWideRequest();
            request.path = treeNode.path;

            $.ajax({
                async: false,
                type: 'POST',
                url: '/file',
                data: JSON.stringify(request),
                dataType: "json",
                success: function (data) {
                    if (!data.succ) {
                        $("#dialogAlert").dialog("open", data.msg);

                        return false;
                    }

                    if ("img" === data.mode) { // 是图片文件的话新建 tab 打开
                        // 最好是开 tab，但这个最终取决于浏览器设置
                        var w = window.open(data.path);
                        return false;
                    }

                    if (!tempCursor) {
                        tempCursor = CodeMirror.Pos(0, 0);
                    }
                    editors.newEditor(data, tempCursor);
                }
            });
        }
    },
    _initSearch: function () {
        $("#dialogSearchForm > input:eq(0)").keyup(function (event) {
            var $okBtn = $(this).closest(".dialog-main").find(".dialog-footer > button:eq(0)");
            if (event.which === 13 && !$okBtn.prop("disabled")) {
                $okBtn.click();
            }

            if ($.trim($(this).val()) === "") {
                $okBtn.prop("disabled", true);
            } else {
                $okBtn.prop("disabled", false);
            }
        });

        $("#dialogSearchForm > input:eq(1)").keyup(function (event) {
            var $okBtn = $(this).closest(".dialog-main").find(".dialog-footer > button:eq(0)");
            if (event.which === 13 && !$okBtn.prop("disabled")) {
                $okBtn.click();
            }
        });

        $("#dialogSearchForm").dialog({
            "modal": true,
            "height": 62,
            "width": 260,
            "title": config.label.search,
            "okText": config.label.search,
            "cancelText": config.label.cancel,
            "afterOpen": function () {
                $("#dialogSearchForm > input:eq(0)").val('').focus();
                $("#dialogSearchForm > input:eq(1)").val('');
                $("#dialogSearchForm").closest(".dialog-main").find(".dialog-footer > button:eq(0)").prop("disabled", true);
            },
            "ok": function () {
                var request = newWideRequest();
                request.dir = wide.curNode.path;
                request.text = $("#dialogSearchForm > input:eq(0)").val();
                request.extension = $("#dialogSearchForm > input:eq(1)").val();

                $.ajax({
                    type: 'POST',
                    url: '/file/search/text',
                    data: JSON.stringify(request),
                    dataType: "json",
                    success: function (data) {
                        if (!data.succ) {
                            return;
                        }

                        $("#dialogSearchForm").dialog("close");
                        editors.appendSearch(data.founds, 'founds', request.text);
                    }
                });
            }
        });
    }
};