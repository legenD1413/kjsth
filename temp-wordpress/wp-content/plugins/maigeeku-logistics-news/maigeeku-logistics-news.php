<?php
/**
 * Plugin Name: MaigeEku 物流资讯管理
 * Plugin URI: https://www.maigeeku.com/plugins/logistics-news
 * Description: 用于管理全球各地区物流资讯内容，并与MaigeEku网站前端集成
 * Version: 1.0.0
 * Author: MaigeEku Team
 * Author URI: https://www.maigeeku.com
 * Text Domain: maigeeku-logistics-news
 */

// 如果直接访问此文件，则中止执行
if (!defined('ABSPATH')) {
    exit;
}

/**
 * 定义插件常量
 */
define('MLN_VERSION', '1.0.0');
define('MLN_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('MLN_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * 插件激活时的处理函数
 */
function mln_activate() {
    // 创建自定义文章类型和分类法
    mln_register_post_types();
    mln_register_taxonomies();
    
    // 刷新固定链接
    flush_rewrite_rules();
    
    // 创建示例内容
    mln_create_sample_content();
}
register_activation_hook(__FILE__, 'mln_activate');

/**
 * 插件停用时的处理函数
 */
function mln_deactivate() {
    // 刷新固定链接
    flush_rewrite_rules();
}
register_deactivation_hook(__FILE__, 'mln_deactivate');

/**
 * 注册物流资讯自定义文章类型
 */
function mln_register_post_types() {
    $labels = array(
        'name'               => '物流资讯',
        'singular_name'      => '物流资讯',
        'menu_name'          => '物流资讯',
        'add_new'            => '添加资讯',
        'add_new_item'       => '添加新物流资讯',
        'edit_item'          => '编辑物流资讯',
        'new_item'           => '新物流资讯',
        'view_item'          => '查看物流资讯',
        'search_items'       => '搜索物流资讯',
        'not_found'          => '未找到物流资讯',
        'not_found_in_trash' => '回收站中未找到物流资讯',
    );

    $args = array(
        'labels'              => $labels,
        'public'              => true,
        'publicly_queryable'  => true,
        'show_ui'             => true,
        'show_in_menu'        => true,
        'query_var'           => true,
        'rewrite'             => array('slug' => 'logistics-news'),
        'capability_type'     => 'post',
        'has_archive'         => true,
        'hierarchical'        => false,
        'menu_position'       => 5,
        'menu_icon'           => 'dashicons-megaphone',
        'supports'            => array('title', 'editor', 'excerpt', 'thumbnail', 'custom-fields'),
        'show_in_rest'        => true, // 支持Gutenberg编辑器
    );

    register_post_type('logistics_news', $args);
}
add_action('init', 'mln_register_post_types');

/**
 * 注册地区分类法
 */
function mln_register_taxonomies() {
    // 地区分类法
    $region_labels = array(
        'name'              => '地区',
        'singular_name'     => '地区',
        'search_items'      => '搜索地区',
        'all_items'         => '所有地区',
        'parent_item'       => '父级地区',
        'parent_item_colon' => '父级地区:',
        'edit_item'         => '编辑地区',
        'update_item'       => '更新地区',
        'add_new_item'      => '添加新地区',
        'new_item_name'     => '新地区名称',
        'menu_name'         => '地区',
    );

    $region_args = array(
        'hierarchical'      => true,
        'labels'            => $region_labels,
        'show_ui'           => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'rewrite'           => array('slug' => 'news-region'),
        'show_in_rest'      => true,
    );

    register_taxonomy('news_region', array('logistics_news'), $region_args);
}
add_action('init', 'mln_register_taxonomies');

/**
 * 添加资讯重要性自定义字段
 */
function mln_add_meta_boxes() {
    add_meta_box(
        'mln_importance',
        '资讯重要性',
        'mln_importance_callback',
        'logistics_news',
        'side',
        'high'
    );
}
add_action('add_meta_boxes', 'mln_add_meta_boxes');

/**
 * 资讯重要性字段回调函数
 */
function mln_importance_callback($post) {
    wp_nonce_field(basename(__FILE__), 'mln_nonce');
    $importance = get_post_meta($post->ID, '_mln_importance', true);
    ?>
    <p>
        <label for="mln_importance">重要性级别：</label>
        <select name="mln_importance" id="mln_importance">
            <option value="normal" <?php selected($importance, 'normal'); ?>>普通</option>
            <option value="important" <?php selected($importance, 'important'); ?>>重要</option>
            <option value="very_important" <?php selected($importance, 'very_important'); ?>>非常重要</option>
        </select>
    </p>
    <?php
}

/**
 * 保存资讯重要性自定义字段
 */
function mln_save_meta_data($post_id) {
    // 验证安全字段
    if (!isset($_POST['mln_nonce']) || !wp_verify_nonce($_POST['mln_nonce'], basename(__FILE__))) {
        return $post_id;
    }

    // 如果是自动保存，不处理
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return $post_id;
    }

    // 检查用户权限
    if ('logistics_news' == $_POST['post_type'] && !current_user_can('edit_page', $post_id)) {
        return $post_id;
    }

    // 更新重要性
    if (isset($_POST['mln_importance'])) {
        update_post_meta($post_id, '_mln_importance', sanitize_text_field($_POST['mln_importance']));
    }
}
add_action('save_post', 'mln_save_meta_data');

/**
 * 创建示例内容
 */
function mln_create_sample_content() {
    // 检查是否已创建示例内容
    if (get_option('mln_sample_content_created')) {
        return;
    }

    // 创建地区分类
    $regions = array(
        'north-america' => '北美',
        'middle-east'   => '中东',
        'europe'        => '欧洲',
        'asia'          => '亚洲',
        'australia'     => '澳洲',
        'africa'        => '非洲',
        'south-america' => '南美'
    );

    foreach ($regions as $slug => $name) {
        wp_insert_term(
            $name,
            'news_region',
            array(
                'slug' => $slug,
                'description' => $name . '地区的物流资讯'
            )
        );
    }

    // 获取北美地区分类ID
    $north_america = get_term_by('slug', 'north-america', 'news_region');
    
    if ($north_america) {
        // 创建示例文章
        $sample_news = array(
            array(
                'title' => '2024年北美物流市场趋势分析',
                'content' => '随着电子商务的持续增长，2024年北美物流市场预计将呈现以下趋势：1. 最后一英里配送自动化 2. 环保物流解决方案需求增加 3. 区域性配送中心扩展 4. 跨境电商物流需求上升',
                'date' => '2024-03-15',
                'importance' => 'important'
            ),
            array(
                'title' => '美国海关最新清关政策解读',
                'content' => '美国海关与边境保护局(CBP)最新发布的清关政策将于2024年4月15日生效。新政策主要涉及：1. 电子申报系统升级 2. 特定商品原产地标准调整 3. 关税结构变化',
                'date' => '2024-03-10',
                'importance' => 'very_important'
            ),
            array(
                'title' => '加拿大物流配送网络优化方案',
                'content' => '针对加拿大广阔的地域特点，物流配送网络优化方案应考虑：1. 枢纽城市仓储布局 2. 季节性运输路线调整 3. 多式联运整合 4. 小型配送中心下沉',
                'date' => '2024-03-05',
                'importance' => 'normal'
            ),
            array(
                'title' => '墨西哥跨境物流发展机遇',
                'content' => '随着USMCA协议的实施，墨西哥跨境物流面临新的发展机遇：1. 制造业转移带动物流需求 2. 边境物流基础设施升级 3. 数字化通关流程简化 4. 近岸外包趋势增强',
                'date' => '2024-03-01',
                'importance' => 'normal'
            ),
        );

        foreach ($sample_news as $news) {
            $post_data = array(
                'post_title'    => $news['title'],
                'post_content'  => $news['content'],
                'post_status'   => 'publish',
                'post_type'     => 'logistics_news',
                'post_date'     => $news['date'],
                'post_author'   => 1,
            );

            // 插入文章
            $post_id = wp_insert_post($post_data);

            if (!is_wp_error($post_id)) {
                // 设置分类
                wp_set_object_terms($post_id, array($north_america->term_id), 'news_region');
                
                // 设置重要性
                update_post_meta($post_id, '_mln_importance', $news['importance']);
            }
        }
    }

    // 标记已创建示例内容
    update_option('mln_sample_content_created', true);
}

/**
 * 注册REST API端点
 */
function mln_register_api_routes() {
    register_rest_route('maigeeku/v1', '/news-by-region/(?P<region>[a-zA-Z0-9-]+)', array(
        'methods' => 'GET',
        'callback' => 'mln_get_news_by_region',
        'permission_callback' => '__return_true',
    ));
}
add_action('rest_api_init', 'mln_register_api_routes');

/**
 * 获取特定地区的新闻API回调
 */
function mln_get_news_by_region($request) {
    $region = $request['region'];
    $limit = isset($request['limit']) ? intval($request['limit']) : 4;
    
    $args = array(
        'post_type' => 'logistics_news',
        'posts_per_page' => $limit,
        'orderby' => 'date',
        'order' => 'DESC',
        'tax_query' => array(
            array(
                'taxonomy' => 'news_region',
                'field' => 'slug',
                'terms' => $region,
            ),
        ),
    );
    
    $query = new WP_Query($args);
    $news = array();
    
    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();
            
            $news[] = array(
                'id' => get_the_ID(),
                'title' => get_the_title(),
                'date' => get_the_date('Y-m-d'),
                'link' => get_permalink(),
                'excerpt' => get_the_excerpt(),
                'importance' => get_post_meta(get_the_ID(), '_mln_importance', true),
            );
        }
        wp_reset_postdata();
    }
    
    return $news;
}

/**
 * 添加管理菜单
 */
function mln_add_admin_menu() {
    add_submenu_page(
        'edit.php?post_type=logistics_news',
        '物流资讯设置',
        '物流资讯设置',
        'manage_options',
        'mln-settings',
        'mln_settings_page'
    );
}
add_action('admin_menu', 'mln_add_admin_menu');

/**
 * 设置页面回调
 */
function mln_settings_page() {
    ?>
    <div class="wrap">
        <h1>物流资讯设置</h1>
        <form method="post" action="options.php">
            <?php
            settings_fields('mln_settings');
            do_settings_sections('mln-settings');
            submit_button();
            ?>
        </form>
        
        <hr />
        
        <h2>WordPress与MaigeEku网站集成指南</h2>
        <div class="mln-integration-guide">
            <h3>1. 前端集成代码</h3>
            <p>将以下JavaScript代码添加到您的MaigeEku网站中，实现物流资讯的动态加载：</p>
            <textarea readonly style="width: 100%; height: 200px; font-family: monospace;">
/**
 * 物流资讯加载器
 * 从WordPress获取特定地区的物流资讯
 */
function loadLogisticsNews(region) {
    const newsContainer = document.querySelector('.article-list');
    if (!newsContainer) return;
    
    // 显示加载状态
    newsContainer.innerHTML = '<li>加载中...</li>';
    
    // 从WordPress API获取数据
    fetch(`https://您的WordPress域名/wp-json/maigeeku/v1/news-by-region/${region}?limit=4`)
        .then(response => response.json())
        .then(news => {
            if (!news || news.length === 0) {
                newsContainer.innerHTML = '<li>暂无资讯</li>';
                return;
            }
            
            // 清空容器
            newsContainer.innerHTML = '';
            
            // 添加新闻项
            news.forEach(item => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <a href="${item.link}">${item.title}</a>
                    <div class="article-date">${item.date}</div>
                `;
                
                newsContainer.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error('加载资讯失败:', error);
            newsContainer.innerHTML = '<li>加载资讯失败，请稍后再试</li>';
        });
}

// 页面加载时执行
document.addEventListener('DOMContentLoaded', function() {
    // 检测当前页面所在区域
    const path = window.location.pathname;
    let region = 'global';
    
    if (path.includes('north-america')) {
        region = 'north-america';
    } else if (path.includes('middle-east')) {
        region = 'middle-east';
    } else if (path.includes('europe')) {
        region = 'europe';
    } else if (path.includes('asia')) {
        region = 'asia';
    } else if (path.includes('australia')) {
        region = 'australia';
    } else if (path.includes('africa')) {
        region = 'africa';
    } else if (path.includes('south-america')) {
        region = 'south-america';
    }
    
    // 加载对应区域的资讯
    loadLogisticsNews(region);
});
            </textarea>
            
            <h3>2. WordPress设置</h3>
            <ul>
                <li>确保WordPress启用了REST API功能</li>
                <li>在WordPress设置中启用CORS，允许您的MaigeEku网站域名访问</li>
                <li>通过"物流资讯"菜单添加和管理各地区的资讯内容</li>
            </ul>
            
            <h3>3. 网站测试</h3>
            <p>完成集成后，访问您的MaigeEku网站各地区页面，确认资讯内容正确加载。</p>
        </div>
    </div>
    <?php
}

/**
 * 注册设置
 */
function mln_register_settings() {
    register_setting('mln_settings', 'mln_items_per_page');
    
    add_settings_section(
        'mln_general_section',
        '常规设置',
        'mln_general_section_callback',
        'mln-settings'
    );
    
    add_settings_field(
        'mln_items_per_page',
        '每页显示资讯数',
        'mln_items_per_page_callback',
        'mln-settings',
        'mln_general_section'
    );
}
add_action('admin_init', 'mln_register_settings');

/**
 * 设置区域回调
 */
function mln_general_section_callback() {
    echo '<p>配置物流资讯插件的常规设置。</p>';
}

/**
 * 每页显示数量设置回调
 */
function mln_items_per_page_callback() {
    $value = get_option('mln_items_per_page', 4);
    echo '<input type="number" name="mln_items_per_page" value="' . esc_attr($value) . '" min="1" max="10" step="1" />';
    echo '<p class="description">前端API默认返回的资讯数量</p>';
}

/**
 * 加载插件文本域
 */
function mln_load_textdomain() {
    load_plugin_textdomain('maigeeku-logistics-news', false, dirname(plugin_basename(__FILE__)) . '/languages');
}
add_action('plugins_loaded', 'mln_load_textdomain'); 