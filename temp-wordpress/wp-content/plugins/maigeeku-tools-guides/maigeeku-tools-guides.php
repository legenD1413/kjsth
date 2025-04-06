<?php
/**
 * Plugin Name: MaigeEku 工具与指南管理
 * Plugin URI: https://www.maigeeku.com/plugins/tools-guides
 * Description: 用于管理工具与指南内容，包括计算工具、指南文档、表格文档、法规解读和互动工具，并与MaigeEku网站前端集成
 * Version: 1.0.0
 * Author: MaigeEku Team
 * Author URI: https://www.maigeeku.com
 * Text Domain: maigeeku-tools-guides
 */

// 如果直接访问此文件，则中止执行
if (!defined('ABSPATH')) {
    exit;
}

/**
 * 定义插件常量
 */
define('MTG_VERSION', '1.0.0');
define('MTG_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('MTG_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * 插件激活时的处理函数
 */
function mtg_activate() {
    // 创建自定义文章类型和分类法
    mtg_register_post_types();
    mtg_register_taxonomies();
    
    // 注册特定于此插件的分类项目
    mtg_register_default_terms();
    
    // 刷新固定链接
    flush_rewrite_rules();
}
register_activation_hook(__FILE__, 'mtg_activate');

/**
 * 插件停用时的处理函数
 */
function mtg_deactivate() {
    // 刷新固定链接
    flush_rewrite_rules();
}
register_deactivation_hook(__FILE__, 'mtg_deactivate');

/**
 * 注册工具与指南自定义文章类型
 */
function mtg_register_post_types() {
    $labels = array(
        'name'               => '工具与指南',
        'singular_name'      => '工具与指南',
        'menu_name'          => '工具与指南',
        'add_new'            => '添加内容',
        'add_new_item'       => '添加新工具或指南',
        'edit_item'          => '编辑工具或指南',
        'new_item'           => '新工具或指南',
        'view_item'          => '查看工具或指南',
        'search_items'       => '搜索工具或指南',
        'not_found'          => '未找到工具或指南',
        'not_found_in_trash' => '回收站中未找到工具或指南',
    );

    $args = array(
        'labels'              => $labels,
        'public'              => true,
        'publicly_queryable'  => true,
        'show_ui'             => true,
        'show_in_menu'        => true,
        'query_var'           => true,
        'rewrite'             => array('slug' => 'tools-guides'),
        'capability_type'     => 'post',
        'has_archive'         => true,
        'hierarchical'        => false,
        'menu_position'       => 5,
        'menu_icon'           => 'dashicons-hammer',
        'supports'            => array('title', 'editor', 'excerpt', 'thumbnail', 'custom-fields'),
        'show_in_rest'        => true, // 支持Gutenberg编辑器
    );

    register_post_type('tools_guides', $args);
}
add_action('init', 'mtg_register_post_types');

/**
 * 注册工具分类和地区分类法
 */
function mtg_register_taxonomies() {
    // 工具分类法
    $category_labels = array(
        'name'              => '工具分类',
        'singular_name'     => '工具分类',
        'search_items'      => '搜索工具分类',
        'all_items'         => '所有工具分类',
        'parent_item'       => '父级分类',
        'parent_item_colon' => '父级分类:',
        'edit_item'         => '编辑工具分类',
        'update_item'       => '更新工具分类',
        'add_new_item'      => '添加新工具分类',
        'new_item_name'     => '新工具分类名称',
        'menu_name'         => '工具分类',
    );

    $category_args = array(
        'hierarchical'      => true,
        'labels'            => $category_labels,
        'show_ui'           => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'rewrite'           => array('slug' => 'tool-category'),
        'show_in_rest'      => true,
    );

    register_taxonomy('tool_category', array('tools_guides'), $category_args);

    // 地区分类法
    $region_labels = array(
        'name'              => '适用地区',
        'singular_name'     => '适用地区',
        'search_items'      => '搜索地区',
        'all_items'         => '所有地区',
        'parent_item'       => '父级地区',
        'parent_item_colon' => '父级地区:',
        'edit_item'         => '编辑地区',
        'update_item'       => '更新地区',
        'add_new_item'      => '添加新地区',
        'new_item_name'     => '新地区名称',
        'menu_name'         => '适用地区',
    );

    $region_args = array(
        'hierarchical'      => true,
        'labels'            => $region_labels,
        'show_ui'           => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'rewrite'           => array('slug' => 'tool-region'),
        'show_in_rest'      => true,
    );

    register_taxonomy('tool_region', array('tools_guides'), $region_args);
}
add_action('init', 'mtg_register_taxonomies');

/**
 * 注册默认分类项目
 */
function mtg_register_default_terms() {
    // 注册工具分类
    $tool_categories = array(
        'calculators' => '计算工具',
        'guides' => '指南文档',
        'forms' => '表格文档',
        'regulations' => '法规解读',
        'interactive' => '互动工具'
    );

    foreach ($tool_categories as $slug => $name) {
        if (!term_exists($name, 'tool_category')) {
            wp_insert_term($name, 'tool_category', array('slug' => $slug));
        }
    }

    // 注册地区
    $regions = array(
        'global' => '全球',
        'north-america' => '北美',
        'south-america' => '南美',
        'europe' => '欧洲',
        'australia' => '澳洲',
        'middle-east' => '中东',
        'southeast-asia' => '东南亚',
        'africa' => '非洲'
    );

    foreach ($regions as $slug => $name) {
        if (!term_exists($name, 'tool_region')) {
            wp_insert_term($name, 'tool_region', array('slug' => $slug));
        }
    }
}

/**
 * 添加自定义字段
 */
function mtg_add_meta_boxes() {
    // 添加重要程度字段
    add_meta_box(
        'mtg_importance',
        '重要程度',
        'mtg_importance_callback',
        'tools_guides',
        'side',
        'high'
    );

    // 添加相关工具字段
    add_meta_box(
        'mtg_related_tools',
        '相关工具',
        'mtg_related_tools_callback',
        'tools_guides',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'mtg_add_meta_boxes');

/**
 * 重要程度字段回调函数
 */
function mtg_importance_callback($post) {
    wp_nonce_field(basename(__FILE__), 'mtg_nonce');
    $importance = get_post_meta($post->ID, '_mtg_importance', true);
    ?>
    <p>
        <label for="mtg_importance">重要程度：</label>
        <select name="mtg_importance" id="mtg_importance">
            <option value="normal" <?php selected($importance, 'normal'); ?>>普通</option>
            <option value="important" <?php selected($importance, 'important'); ?>>重要</option>
            <option value="critical" <?php selected($importance, 'critical'); ?>>关键</option>
        </select>
    </p>
    <?php
}

/**
 * 相关工具字段回调函数
 */
function mtg_related_tools_callback($post) {
    wp_nonce_field(basename(__FILE__), 'mtg_nonce');
    $related_tools = get_post_meta($post->ID, '_mtg_related_tools', true);
    
    if (!is_array($related_tools)) {
        $related_tools = array();
    }
    ?>
    <div id="related-tools-container">
        <p>添加与此工具相关的其他工具或指南：</p>
        
        <?php 
        // 获取所有工具与指南
        $args = array(
            'post_type' => 'tools_guides',
            'posts_per_page' => -1,
            'post__not_in' => array($post->ID),
            'orderby' => 'title',
            'order' => 'ASC'
        );
        
        $tools = get_posts($args);
        
        if ($tools) : 
        ?>
            <select id="related-tool-select">
                <option value="">-- 选择相关工具 --</option>
                <?php foreach ($tools as $tool) : ?>
                    <option value="<?php echo $tool->ID; ?>"><?php echo $tool->post_title; ?></option>
                <?php endforeach; ?>
            </select>
            <button type="button" id="add-related-tool" class="button">添加</button>
            
            <ul id="related-tools-list">
                <?php foreach ($related_tools as $tool_id) : 
                    $tool = get_post($tool_id);
                    if ($tool) : 
                ?>
                    <li>
                        <input type="hidden" name="mtg_related_tools[]" value="<?php echo $tool->ID; ?>">
                        <?php echo $tool->post_title; ?>
                        <a href="#" class="remove-related-tool">移除</a>
                    </li>
                <?php 
                    endif;
                endforeach; 
                ?>
            </ul>
            
            <script type="text/javascript">
                jQuery(document).ready(function($) {
                    // 添加相关工具
                    $('#add-related-tool').on('click', function() {
                        var toolId = $('#related-tool-select').val();
                        var toolName = $('#related-tool-select option:selected').text();
                        
                        if (toolId) {
                            var html = '<li>';
                            html += '<input type="hidden" name="mtg_related_tools[]" value="' + toolId + '">';
                            html += toolName;
                            html += ' <a href="#" class="remove-related-tool">移除</a>';
                            html += '</li>';
                            
                            $('#related-tools-list').append(html);
                            $('#related-tool-select').val('');
                        }
                    });
                    
                    // 移除相关工具
                    $(document).on('click', '.remove-related-tool', function(e) {
                        e.preventDefault();
                        $(this).parent().remove();
                    });
                });
            </script>
        <?php else: ?>
            <p>暂无其他工具可选择。请先添加更多工具与指南内容。</p>
        <?php endif; ?>
    </div>
    <?php
}

/**
 * 保存自定义字段数据
 */
function mtg_save_meta_data($post_id) {
    // 验证安全字段
    if (!isset($_POST['mtg_nonce']) || !wp_verify_nonce($_POST['mtg_nonce'], basename(__FILE__))) {
        return $post_id;
    }

    // 如果是自动保存，不处理
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return $post_id;
    }

    // 检查用户权限
    if ('tools_guides' == $_POST['post_type'] && !current_user_can('edit_page', $post_id)) {
        return $post_id;
    }

    // 更新重要程度
    if (isset($_POST['mtg_importance'])) {
        update_post_meta($post_id, '_mtg_importance', sanitize_text_field($_POST['mtg_importance']));
    }

    // 更新相关工具
    if (isset($_POST['mtg_related_tools'])) {
        $related_tools = array_map('intval', $_POST['mtg_related_tools']);
        update_post_meta($post_id, '_mtg_related_tools', $related_tools);
    } else {
        update_post_meta($post_id, '_mtg_related_tools', array());
    }
}
add_action('save_post', 'mtg_save_meta_data');

/**
 * 在发布编辑器中添加提示
 */
function mtg_add_editor_notice() {
    $screen = get_current_screen();
    
    if ('tools_guides' === $screen->post_type) {
        ?>
        <div class="notice notice-info inline">
            <p><strong>提示：</strong></p>
            <ul>
                <li>- 为了添加交互式工具，请在内容中使用类名为 <code>interactive-tool</code> 的 div。</li>
                <li>- 示例: <code>&lt;div class="interactive-tool"&gt;...工具代码...&lt;/div&gt;</code></li>
                <li>- 您可以在右侧面板中设置工具分类、适用地区和重要程度。</li>
                <li>- 相关工具部分可以添加与当前工具相关的其他工具或指南。</li>
            </ul>
        </div>
        <?php
    }
}
add_action('admin_notices', 'mtg_add_editor_notice');

/**
 * 注册插件设置页面
 */
function mtg_add_admin_menu() {
    add_submenu_page(
        'edit.php?post_type=tools_guides',
        '工具与指南设置',
        '设置',
        'manage_options',
        'mtg-settings',
        'mtg_settings_page'
    );
}
add_action('admin_menu', 'mtg_add_admin_menu');

/**
 * 设置页面回调函数
 */
function mtg_settings_page() {
    ?>
    <div class="wrap">
        <h1>工具与指南设置</h1>
        
        <form method="post" action="options.php">
            <?php
            settings_fields('mtg_options');
            do_settings_sections('mtg-settings');
            submit_button();
            ?>
        </form>
        
        <div class="card">
            <h2>工具与指南管理说明</h2>
            <p>本插件用于管理网站的工具与指南内容，包括：</p>
            <ul>
                <li>- 计算工具：用于各类物流相关计算的工具</li>
                <li>- 指南文档：物流操作指南和教程</li>
                <li>- 表格文档：物流所需的各类表格</li>
                <li>- 法规解读：海关和物流法规的解读</li>
                <li>- 互动工具：提供交互式体验的工具</li>
            </ul>
            
            <h3>添加交互式工具</h3>
            <p>要添加交互式工具，在工具内容编辑器中使用以下格式：</p>
            <pre>
&lt;div class="interactive-tool"&gt;
    &lt;h3&gt;工具名称&lt;/h3&gt;
    &lt;!-- 工具表单和交互元素 --&gt;
    &lt;div id="result" class="tool-result"&gt;&lt;/div&gt;
&lt;/div&gt;

&lt;script&gt;
    // 工具特定的JavaScript代码
&lt;/script&gt;
            </pre>
            
            <h3>生成静态页面</h3>
            <p>工具与指南内容发布后，需要使用生成脚本将其转换为静态HTML页面：</p>
            <ol>
                <li>1. 在服务器执行 <code>node tools/generate-tools-guides.js</code></li>
                <li>2. 生成的静态页面将保存在 <code>tools-guides/</code> 目录中</li>
            </ol>
        </div>
    </div>
    <?php
}

/**
 * 注册插件设置
 */
function mtg_register_settings() {
    register_setting('mtg_options', 'mtg_items_per_page');
    
    add_settings_section(
        'mtg_general_section',
        '常规设置',
        'mtg_general_section_callback',
        'mtg-settings'
    );
    
    add_settings_field(
        'mtg_items_per_page',
        '每页显示工具数量',
        'mtg_items_per_page_callback',
        'mtg-settings',
        'mtg_general_section'
    );
}
add_action('admin_init', 'mtg_register_settings');

/**
 * 设置区域回调函数
 */
function mtg_general_section_callback() {
    echo '<p>配置工具与指南的显示方式和API设置。</p>';
}

/**
 * 每页显示数量字段回调函数
 */
function mtg_items_per_page_callback() {
    $items_per_page = get_option('mtg_items_per_page', 8);
    echo '<input type="number" id="mtg_items_per_page" name="mtg_items_per_page" value="' . esc_attr($items_per_page) . '" min="1" max="50"> <span class="description">每个分类页面默认显示的工具数量</span>';
}

/**
 * 注册REST API路由
 */
function mtg_register_api_routes() {
    register_rest_route('maigeeku/v1', '/tools-by-category/(?P<category>[\w-]+)', array(
        'methods' => 'GET',
        'callback' => 'mtg_get_tools_by_category',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('maigeeku/v1', '/tools-by-region/(?P<region>[\w-]+)', array(
        'methods' => 'GET',
        'callback' => 'mtg_get_tools_by_region',
        'permission_callback' => '__return_true'
    ));
}
add_action('rest_api_init', 'mtg_register_api_routes');

/**
 * 按分类获取工具与指南
 */
function mtg_get_tools_by_category($request) {
    $category = $request->get_param('category');
    $limit = $request->get_param('limit') ? (int) $request->get_param('limit') : get_option('mtg_items_per_page', 8);
    
    // 获取分类ID
    $category_term = get_term_by('slug', $category, 'tool_category');
    if (!$category_term) {
        return new WP_Error('invalid_category', '无效的工具分类', array('status' => 404));
    }
    
    $args = array(
        'post_type' => 'tools_guides',
        'posts_per_page' => $limit,
        'tax_query' => array(
            array(
                'taxonomy' => 'tool_category',
                'field' => 'term_id',
                'terms' => $category_term->term_id
            )
        )
    );
    
    return mtg_prepare_tools_response($args);
}

/**
 * 按地区获取工具与指南
 */
function mtg_get_tools_by_region($request) {
    $region = $request->get_param('region');
    $limit = $request->get_param('limit') ? (int) $request->get_param('limit') : get_option('mtg_items_per_page', 8);
    
    // 获取地区ID
    $region_term = get_term_by('slug', $region, 'tool_region');
    if (!$region_term) {
        return new WP_Error('invalid_region', '无效的地区', array('status' => 404));
    }
    
    $args = array(
        'post_type' => 'tools_guides',
        'posts_per_page' => $limit,
        'tax_query' => array(
            array(
                'taxonomy' => 'tool_region',
                'field' => 'term_id',
                'terms' => $region_term->term_id
            )
        )
    );
    
    return mtg_prepare_tools_response($args);
}

/**
 * 准备工具与指南API响应
 */
function mtg_prepare_tools_response($args) {
    $posts = get_posts($args);
    $response = array();
    
    foreach ($posts as $post) {
        // 获取分类
        $categories = wp_get_post_terms($post->ID, 'tool_category');
        $category = !empty($categories) ? $categories[0]->name : '';
        $category_slug = !empty($categories) ? $categories[0]->slug : '';
        
        // 获取地区
        $regions = wp_get_post_terms($post->ID, 'tool_region');
        $region = !empty($regions) ? $regions[0]->name : '全球';
        $region_slug = !empty($regions) ? $regions[0]->slug : 'global';
        
        // 获取重要程度
        $importance = get_post_meta($post->ID, '_mtg_importance', true);
        if (!$importance) {
            $importance = 'normal';
        }
        
        // 构建响应
        $response[] = array(
            'id' => $post->ID,
            'title' => $post->post_title,
            'excerpt' => get_the_excerpt($post),
            'date' => get_the_date('Y-m-d', $post),
            'category' => $category,
            'category_slug' => $category_slug,
            'region' => $region,
            'region_slug' => $region_slug,
            'importance' => $importance,
            'link' => get_permalink($post->ID)
        );
    }
    
    return $response;
}

/**
 * 添加指示交互式工具的CSS类到TinyMCE
 */
function mtg_add_editor_styles() {
    add_editor_style('css/editor-style.css');
}
add_action('admin_init', 'mtg_add_editor_styles');

/**
 * 添加编辑器工具样式
 */
function mtg_add_editor_style_css() {
    if (get_current_screen()->base !== 'post' || get_current_screen()->post_type !== 'tools_guides') {
        return;
    }
    ?>
    <style>
        .interactive-tool {
            background-color: #f0f7ff;
            border: 1px solid #cce5ff;
            padding: 15px;
            margin: 15px 0;
            border-radius: 5px;
        }
        .interactive-tool h3 {
            color: #0066cc;
            margin-top: 0;
        }
        .tool-result {
            margin-top: 15px;
            padding: 10px;
            background-color: #e8f4ff;
            border-radius: 3px;
        }
    </style>
    <?php
}
add_action('admin_head', 'mtg_add_editor_style_css');

/**
 * 添加自定义脚本到管理界面
 */
function mtg_admin_scripts() {
    if (get_current_screen()->base !== 'post' || get_current_screen()->post_type !== 'tools_guides') {
        return;
    }
    
    wp_enqueue_script('jquery-ui-sortable');
}
add_action('admin_enqueue_scripts', 'mtg_admin_scripts');

/**
 * 加载文本域
 */
function mtg_load_textdomain() {
    load_plugin_textdomain('maigeeku-tools-guides', false, dirname(plugin_basename(__FILE__)) . '/languages');
}
add_action('init', 'mtg_load_textdomain'); 