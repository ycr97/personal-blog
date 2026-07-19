---
author: "ycr97"
pubDatetime: 2019-03-17T00:00:00+08:00
title: "java实现类似Windows7上的时钟日历小程序"
draft: false
tags: ["Java"]
category: "Java"
description: "java实现时钟日历小程序 最终效果如下图 具体代码如下:"
---

#java实现时钟日历小程序 
最终效果如下图
![日历主面板](/personal-blog/images/csdn/88627671/01-9f9b7eeb6859.png)![月份](/personal-blog/images/csdn/88627671/02-93ea4dda02a0.png)![年份](/personal-blog/images/csdn/88627671/03-1d0ffd672615.png)
具体代码如下:

```
package swing2;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.geom.AffineTransform;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

public class CalendarDemo extends JFrame {
    public static void main(String[] args) {
        CalendarDemo cd = new CalendarDemo();
        cd.show();
        System.out.println(cd.getSize());
    }

    public CalendarDemo() {
        setTitle("xx");
        //获取屏幕尺寸
        Dimension screenSize = Toolkit.getDefaultToolkit().getScreenSize();
        int width = screenSize.width/2;//width = 740
        int height = screenSize.height/2;//heitht = 540
       /* int width = 800;
        int height = 540;*/
        //设置关闭窗体时关闭程序
        setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);
        //设置窗体尺寸
        setSize(width, height);
        //允许用户改变窗体大小
        setResizable(true);
        setVisible(true);

        //将窗体容器分为左右两部分
        JSplitPane splitPane = new JSplitPane();
        //设置分割线位置
        splitPane.setDividerLocation(500);
        //设置分割线大小
        splitPane.setDividerSize(-1);

        //日历
        CalendarPanel calenderPanel = new CalendarPanel(this);
        //时钟
        ColockPanel colockPanel = new ColockPanel();
        //设置左边面板为日历面板
        splitPane.setLeftComponent(calenderPanel);
        //设置右边面板为时钟面板
        splitPane.setRightComponent(colockPanel);
        //将分割对象装进容器
        Container container = getContentPane();
        container.add(splitPane);

        new Thread(colockPanel).start();
    }

}

//时钟面板
class ColockPanel extends JPanel implements Runnable,ActionListener{
/*    private int lastxs, lastys, lastxm, lastym, lastxh, lastyh;
    private Label cur_clock, cur_week;*/
    //private Label cur_day;
	private int lastxs, lastys, lastxm, lastym, lastxh, lastyh;
    private Label cur_clock, cur_week;
    private JButton cur_day;

    public ColockPanel() {
/*        this.setLayout(null);
        this.setBackground(new Color(255, 255, 255));
        setVisible(true);

        cur_clock = new Label("", Label.CENTER);
        cur_clock.setFont(new Font("Dialog", 1, 15));
        cur_clock.setBounds(100, 350, 100, 40);
        //cur_clock.setBackground(new Color(255, 255, 255));
        cur_clock.setForeground(Color.black);

        cur_week = new Label("", Label.CENTER);
        cur_week.setFont(new Font("Dialog", 1, 15));
        cur_week.setBounds(100, 390, 100, 40);
        //cur_week.setBackground(new Color(255, 255, 255));
        cur_week.setForeground(Color.black);
        cur_week.setVisible(true);

        add(cur_week);
        add(cur_clock);*/

    }
    @Override
    protected void paintComponent(Graphics g) {
        Graphics2D g2d = (Graphics2D) g;

        //去锯齿
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        //清空原来的图形
        g2d.setColor(Color.white);
        g2d.fillRect(0, 0, this.getWidth(), this.getHeight());
        //设置画笔颜色
        g2d.setColor(Color.black);
        //圆心坐标
        int xCenter = this.getWidth() / 2;
        int yCenter = this.getHeight() / 2;

        //计算半径
        int radius = (int) Math.min(this.getWidth(), this.getHeight() * 0.8 * 0.5);
        //画外圆边框
        g2d.drawOval(xCenter - radius - 2, yCenter - radius - 2, radius * 2 + 2, radius * 2 + 2);
        //画表盘
        g2d.setColor(new Color(193, 241, 251));
        g2d.fillOval(xCenter - radius, yCenter - radius, 2 * radius, 2 * radius);
        g2d.setColor(Color.black);

        //画时钟的12个数字
        for (int i = 1; i <= 12; i++) {
            double dd = (Math.PI * i) / 6;
            int x = (int) (Math.sin(dd) * (radius - 20) + xCenter);
            int y = (int) (yCenter - Math.cos(dd) * (radius - 20));
            g2d.drawString(Integer.toString(i), x - 5, y + 7);
        }
        AffineTransform at = g2d.getTransform();

        //画60个刻度
        for (int i = 0; i < 60; i++) {
            int w = i % 5 == 0 ? 3 : 1;
            int h = i % 5 == 0 ? 8 : 5;
            g2d.fillRect(xCenter - 2, yCenter - radius, w, h);//绘制矩形
            g2d.rotate(Math.toRadians(6), xCenter, yCenter);//按参数1的弧度旋转图形
        }
        //获取时间
        Calendar calendar = Calendar.getInstance();
        int second = calendar.get(Calendar.SECOND);
        int minute = calendar.get(Calendar.MINUTE);
        int hour = calendar.get(Calendar.HOUR_OF_DAY);

        Date currentTime = new Date();

        SimpleDateFormat formatter_day = new SimpleDateFormat("yyyy-MM-dd");
        SimpleDateFormat formatter_clock = new SimpleDateFormat("HH:mm:ss");
        SimpleDateFormat format_week = new SimpleDateFormat("EEEE");

        setFont(new Font("宋体", Font.PLAIN, 18));
        g2d.drawString(format_week.format(currentTime), xCenter - 25, yCenter + (radius / 2));
        g2d.drawString(formatter_clock.format(currentTime), xCenter - 35, yCenter + (radius / 3));
        g2d.drawString(formatter_day.format(currentTime), xCenter - 40, yCenter - (radius / 2));

        int xh = (int) (Math.sin(Math.PI / 360 * (60 * hour + minute)) * (radius / 2) + xCenter);
        int yh = (int) (yCenter - (Math.cos(Math.PI / 360 * (60 * hour + minute)) * (radius / 2)));

        int xm = (int) (Math.sin(Math.PI * minute / 30) * ((2 * radius) / 3) + xCenter);
        int ym = (int) (yCenter - (Math.cos(Math.PI * minute / 30) * ((2 * radius) / 3)));

        int xs = (int) (Math.sin(Math.PI * second / 30) * ((4 * radius) / 5) + xCenter);
        int ys = (int) (yCenter - (Math.cos(Math.PI * second / 30) * ((4 * radius) / 5)));

        //画时针,分针,秒针
        g2d.setColor(Color.black);
        g2d.setStroke(new BasicStroke(3.0f));
        g2d.drawLine(xCenter, yCenter, xh, yh);
        g2d.setStroke(new BasicStroke(2.0f));
        g2d.drawLine(xCenter, yCenter, xm, ym);
        g2d.setStroke(new BasicStroke(1.0f));
        g2d.drawLine(xCenter, yCenter, xs, ys);

        g2d.fillOval(xCenter - 5, yCenter - 5, 10, 10);
    }

   /* @Override
    public void paint(Graphics g) {
        //g.fillRect(30, , 240, 240);
    	g.setColor(Color.white);
    	g.fillRect(0, 0, 300, 500);
        //设置表盘颜色
        g.setColor(new Color(120, 240, 240));
        //设置表盘
        g.fillRoundRect(32, 66, 240, 240, 240, 240);
        g.setColor(Color.BLACK);
        g.fillRoundRect(145, 185, 10, 10, 10, 10);
        int xh, yh, xm, ym, xs, ys, s, m, h, xcenter, ycenter;
        Date currenttime = new Date();//获取当前日期和时间
        s = currenttime.getSeconds();
        m = currenttime.getMinutes();
        h = currenttime.getHours();
        //SimpleDateFormat formatter_day = new SimpleDateFormat("yyyy-MM-dd");
        SimpleDateFormat formatter_clock = new SimpleDateFormat("HH:mm:ss");
        SimpleDateFormat format_week = new SimpleDateFormat("EEEE");

        cur_clock.setText(formatter_clock.format(currenttime));
        cur_week.setText(format_week.format(currenttime));
        xcenter = 150;
        ycenter = 190;
        //计算秒针,分针,时针的位置
        xs = (int) (Math.cos(s * 3.14f / 30 - 3.14f / 2) * 100 + xcenter);
        ys = (int) (Math.sin(s * 3.14f / 30 - 3.14f / 2) * 100 + ycenter);
        xm = (int) (Math.cos(m * 3.14f / 30 - 3.14f / 2) * 80 + xcenter);
        ym = (int) (Math.sin(m * 3.14f / 30 - 3.14f / 2) * 80 + ycenter);
        if (h <= 12) {
            xh = (int) (Math.cos((h * 60 + m )* 3.14f / 360 - 3.14f / 2) * 60 + xcenter);
            yh = (int) (Math.sin((h * 60 + m )* 3.14f / 360 - 3.14f / 2) * 60 + ycenter);
        } else {
            h = h - 12;
            xh = (int) (Math.cos((h * 60 + m )* 3.14f / 360 - 3.14f / 2) * 60 + xcenter);
            yh = (int) (Math.sin((h * 60 + m )* 3.14f / 360 - 3.14f / 2) * 60 + ycenter);

        }

        //g.fillOval(xcenter-85,ycenter-85,240,240);
        g.setFont(new Font("TimesRoman", Font.PLAIN, 14));
        //设置表盘数字颜色
        g.setColor(Color.black);
        //设置表盘数字
        g.drawString("12", xcenter, ycenter - 115);
        g.drawString("1", xcenter + 55, ycenter - 100);
        g.drawString("2", xcenter + 100, ycenter - 55);
        g.drawString("3", xcenter + 115, ycenter);
        g.drawString("4", xcenter + 100, ycenter + 55);
        g.drawString("5", xcenter + 55, ycenter + 100);
        g.drawString("6", xcenter, ycenter + 115);
        g.drawString("7", xcenter - 55, ycenter + 100);
        g.drawString("8", xcenter - 100, ycenter + 55);
        g.drawString("9", xcenter - 115, ycenter);
        g.drawString("10", xcenter - 100, ycenter - 55);
        g.drawString("11", xcenter - 55, ycenter - 100);

        //绘制指针
        g.setColor(Color.black);
        Graphics2D g2 = (Graphics2D) g;
        g2.setStroke(new BasicStroke(1.0f));//设置指针粗细
        g.drawLine(xcenter, ycenter, xs, ys);
        g2.setStroke(new BasicStroke(2.0f));
        g.drawLine(xcenter, ycenter, xm, ym);
        g2.setStroke(new BasicStroke(3.0f));
        g.drawLine(xcenter, ycenter, xh, yh);

        lastxs = xs;
        lastys = ys; //保存指针位置
        lastxm = xm;
        lastym = ym;
        lastxh = xh;
        lastyh = yh;
        
        //super.paint(g);

    }*/
   

    @Override
    public void run() {
        while (true) {
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            repaint(0,70,300,500);
        }
    }

    @Override
    public void actionPerformed(ActionEvent e) {

    }
}

//日历面板
class CalendarPanel extends JPanel implements ActionListener {
    private JPanel selectPanel;//主面板上方有:月份减少按钮 ,选择月份 年份按钮,月份增加按钮
    private JPanel showPanel;//该面板有三种显示状态,一种显示日历,一种显示选择月份,一种显示选择年份
    private JPanel weekdayPanel;//该面板被添加到showPanel,用于静态显示周一到周日
    private JPanel calshowPanel;//该面板被添加到showPanel,用于显示一月中的每一天
    private JPanel selectMonth;//该面板被添加到showPanel,用于显示一年中的所有月份
    private JPanel selectYear;//该面板被添加到showPanel,用于显示年份的按钮

    private JButton btleft;//selectPanel中的三个按钮
    private JButton btmid;
    private JButton btright;

    private Button[] btday = new Button[42];
    private Button[] btmouth = new Button[12];
    private Button[] btyear = new Button[12];

    private Calendar curcalendar;//记录当前日历上显示的日期
    private JFrame jFrame;//存储parent的JFrame,用于调用其setVisible更新界面

    public CalendarPanel(JFrame jFrame) {
        this.jFrame = jFrame;
        setLayout(null);//设置布局为null
        setBackground(new Color(143, 241, 219));

        selectPanel = new JPanel();
        selectPanel.setBackground(new Color(193, 241, 151));
        selectPanel.setBounds(0, 0, 500, 50);//设置该面板相对于容器的位置和大小
        selectPanel.setLayout(null);
        add(selectPanel);

        btleft = new JButton("<");
        btleft.setBounds(50, 10, 50, 30);
        btleft.addActionListener(this);
        selectPanel.add(btleft);

        btmid = new JButton("");
        btmid.setBounds(175, 10, 150, 30);
        btmid.addActionListener(this);
        selectPanel.add(btmid);

        btright = new JButton(">");
        btright.setBounds(400, 10, 50, 30);
        btright.addActionListener(this);
        selectPanel.add(btright);

        weekdayPanel = new JPanel();
        weekdayPanel.setBounds(0, 0, 490, 20);
        weekdayPanel.setBackground(new Color(83, 199, 241));
        weekdayPanel.setLayout(new GridLayout(1, 7));
        weekdayPanel.setBorder(BorderFactory.createLineBorder(Color.black));
        weekdayPanel.add(new JLabel("日", JLabel.CENTER));
        weekdayPanel.add(new JLabel("一", JLabel.CENTER));
        weekdayPanel.add(new JLabel("二", JLabel.CENTER));
        weekdayPanel.add(new JLabel("三", JLabel.CENTER));
        weekdayPanel.add(new JLabel("四", JLabel.CENTER));
        weekdayPanel.add(new JLabel("五", JLabel.CENTER));
        weekdayPanel.add(new JLabel("六", JLabel.CENTER));

        calshowPanel = new JPanel();
        calshowPanel.setBounds(0, 130, 500,430);
        calshowPanel.setLayout(new GridLayout(6, 7));//6行7列的网格布局

        for (int i = 0; i < 42; i++) {
            btday[i] = new Button();
            btday[i].setBackground(new Color(255,255,255));//new Color(202, 211, 221)灰色
            btday[i].setFont(new Font("宋体", 4, 14));//设置字体
            btday[i].addActionListener(this);
        }

        curcalendar = Calendar.getInstance();//返回当前时间,默认语言和默认环境的日历
        int monthday = curcalendar.get(Calendar.DAY_OF_MONTH);//获取在当前月份的第几天
        int weekday = curcalendar.get(Calendar.DAY_OF_WEEK);//获取在当前星期的第几天(星期日为第一天)

        System.out.println(monthday + "---" + weekday);

        int startcol = 7 - (monthday - weekday) % 7;//当月第一天是一个星期中的第几天
        if (startcol > 7) {
            startcol = startcol%7;
        }
        System.out.println(startcol);

        String midbt_lab = curcalendar.get(Calendar.YEAR) + "年" + (curcalendar.get(Calendar.MONTH) + 1) + "月";
        btmid.setText(midbt_lab);

        Calendar lastcalendar = (Calendar) curcalendar.clone();
        lastcalendar.set(Calendar.DAY_OF_MONTH, 1);
        lastcalendar.add(Calendar.DAY_OF_MONTH, -startcol);
        int tablestart = lastcalendar.get(Calendar.DAY_OF_MONTH);//该页日历起始时是当月的第几天(例如日历上的第一天是25号)

        int k = 0;
        for (int i = 0; i < startcol; i++) {
            btday[k].setForeground(Color.GRAY);
            btday[k].setLabel((tablestart++) + "");
            calshowPanel.add(btday[k++]);
        }
        for (int i = 1; i <= curcalendar.getActualMaximum(Calendar.DAY_OF_MONTH); i++) {
            btday[k].setForeground(Color.black);
            btday[k].setLabel(i + "");
            if (curcalendar.get(Calendar.DAY_OF_MONTH) == i-1) {
            	btday[i].setBackground(new Color(193, 241, 251));
            }
            calshowPanel.add(btday[k++]);
            
        }
        for (int i = 1; i <= 42 - startcol - curcalendar.getActualMaximum(Calendar.DAY_OF_MONTH); i++) {
            btday[k].setForeground(Color.GRAY);
            btday[k].setLabel(i + "");
            calshowPanel.add(btday[k++]);
        }

        showPanel = new JPanel();
        showPanel.setBounds(0, 50, 500, 450);
        showPanel.setLayout(new BorderLayout());
        showPanel.setBorder(BorderFactory.createLineBorder(Color.black));
        showPanel.add(weekdayPanel, BorderLayout.NORTH);
        showPanel.add(calshowPanel, BorderLayout.CENTER);

        add(showPanel);

        //选择月份
        selectMonth = new JPanel(new GridLayout(3, 4));
        selectMonth.setBounds(0, 70, 500, 370);

        for (int i = 0; i < 12; i++) {
            btmouth[i] = new Button((i + 1) + "月");
            btmouth[i].addActionListener(this);
            btmouth[i].setBackground(new Color(255,255,255));
            btmouth[i].setFont(new Font("Dialog",5,18));
            selectMonth.add(btmouth[i]);
        }
        //选择年份
        selectYear = new JPanel(new GridLayout(3, 4));
        selectYear.setBounds(0, 45, 500, 400);
        for (int i = 0; i < 12; i++) {
            btyear[i] = new Button((curcalendar.get(Calendar.YEAR) - 6 + i) + "");
            btyear[i].addActionListener(this);
            btyear[i].setBackground(new Color(255,255,255));
            btyear[i].setFont(new Font("Dialog",5,18));
            selectYear.add(btyear[i]);
        }

    }

    //更新日历方法
    private void updatebtday() {
        int monthday = curcalendar.get(Calendar.DAY_OF_MONTH);//当前日期(在一月中的第几天)
        int weekday = curcalendar.get(Calendar.DAY_OF_WEEK);//(在一周中的第几天)
        int startcol = 7 - (monthday - weekday) % 7;//第一天是星期几
        if (startcol > 7) {
            startcol = startcol%7;;
        }

        Calendar lastcalendar = (Calendar) curcalendar.clone();
        lastcalendar.set(Calendar.DAY_OF_MONTH, 1);
        lastcalendar.add(Calendar.DAY_OF_MONTH, -startcol);
        int tablestart = lastcalendar.get(Calendar.DAY_OF_MONTH);

        String midbt_lab = curcalendar.get(Calendar.YEAR) + "年" + (curcalendar.get(Calendar.MONTH) + 1) + "月";
        btmid.setText(midbt_lab);

        int k = 0;
        for (int i = 0; i < startcol; i++) {
            btday[k].setForeground(Color.GRAY);
            btday[k++].setLabel((tablestart++) + "");
        }
        for (int i = 1; i <= curcalendar.getActualMaximum(Calendar.DAY_OF_MONTH); i++) {
            btday[k].setForeground(Color.black);
            btday[k++].setLabel(i + "");
        }
        for (int i = 1; i <= 42 - startcol - curcalendar.getActualMaximum(Calendar.DAY_OF_MONTH); i++) {
            btday[k].setForeground(Color.GRAY);
            btday[k++].setLabel(i + "");
        }
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        if (e.getSource() == btmid) {//中间按钮
            JPanel getPanel = (JPanel) showPanel.getComponent(0);
            if (getPanel == weekdayPanel) {
                btmid.setText(curcalendar.get(Calendar.YEAR) + "");
                showPanel.removeAll();
                showPanel.add(selectMonth);
            } else if (getPanel == selectMonth) {
                showPanel.removeAll();
                showPanel.add(selectYear);
                btmid.setText((curcalendar.get(Calendar.YEAR) - 6) + "-" + (curcalendar.get(Calendar.YEAR) + 5));
            }
            jFrame.setVisible(true);
        } else if (e.getSource() == btleft) {//左边按钮
            JPanel getPanel = (JPanel) showPanel.getComponent(0);//获取容器中的第1个组件
            if (getPanel == weekdayPanel) {
                int month1 = curcalendar.get(Calendar.MONTH);
                curcalendar.set(Calendar.MONTH, month1 - 1);
                updatebtday();
            } else if (getPanel == selectMonth) {
                int year = curcalendar.get(Calendar.YEAR);
                curcalendar.set(Calendar.YEAR, year - 1);
                btmid.setText(curcalendar.get(Calendar.YEAR) + "");
            } else {
                String str = btyear[0].getLabel();
                int first = Integer.parseInt(str);
                for (int i = 11; i >= 0; i--) {
                    btyear[i].setLabel((--first) + "");
                }
                btmid.setText(first + "-" + (first + 11));
            }
        } else if (e.getSource() == btright) {
            JPanel getPanel = (JPanel) showPanel.getComponent(0);
            if (getPanel == weekdayPanel) {//如得到的组件是星期Panel,那么更新日历
                int month1 = curcalendar.get(Calendar.MONTH);
                curcalendar.set(Calendar.MONTH, month1 + 1);
                updatebtday();
            } else if (getPanel == selectMonth) {//如果得到的组件是月份的Panel,那么更新年份
                int year = curcalendar.get(Calendar.YEAR);
                curcalendar.set(Calendar.YEAR, year + 1);
                btmid.setText(curcalendar.get(Calendar.YEAR) + "");
            } else {	//如果是选择年份界面,那么改变年份和mid按钮
                String str = btyear[11].getLabel();
                int last = Integer.parseInt(str);
                for (int i = 0; i < 12; i++) {
                    btyear[i].setLabel((++last) + "");
                }
                btmid.setText((last - 11) + "-" + last);
            }
        } else if (((Button) e.getSource()).getForeground() == Color.GRAY) {//如果发生事件的为灰色按钮
            String command = e.getActionCommand();
            int com_int = Integer.parseInt(command);
            if (com_int > 20) {//大于20表明是上个月的,设置月份,调用更新月份的方法
                int month3 = curcalendar.get(Calendar.MONTH);
                curcalendar.set(Calendar.MONTH, month3 - 1);
            } else if (com_int < 20) {//小于20为下个月的
                int month3 = curcalendar.get(Calendar.MONTH);
                curcalendar.set(Calendar.MONTH, month3 + 1);
            }
            updatebtday();

        } else if (((Button) e.getSource()).getForeground() == Color.black) {

        } else if (e.getSource() == btyear[0]) {
            String str = e.getActionCommand();
            int year = Integer.parseInt(str);
            curcalendar.set(Calendar.YEAR, year);
            showPanel.removeAll();
            showPanel.add(selectMonth);
            btmid.setText(str);

        } else if (e.getSource() == btyear[1]) {
            String str = e.getActionCommand();
            int year = Integer.parseInt(str);
            curcalendar.set(Calendar.YEAR, year);
            showPanel.removeAll();
            showPanel.add(selectMonth);
            btmid.setText(str);
        } else if (e.getSource() == btyear[2]) {
            String str = e.getActionCommand();
            int year = Integer.parseInt(str);
            curcalendar.set(Calendar.YEAR, year);
            showPanel.removeAll();
            showPanel.add(selectMonth);
            btmid.setText(str);

        } else if (e.getSource() == btyear[3]) {
            String str = e.getActionCommand();
            int year = Integer.parseInt(str);
            curcalendar.set(Calendar.YEAR, year);
            showPanel.removeAll();
            showPanel.add(selectMonth);
            btmid.setText(str);

        } else if (e.getSource() == btyear[4]) {
            String str = e.getActionCommand();
            int year = Integer.parseInt(str);
            curcalendar.set(Calendar.YEAR, year);
            showPanel.removeAll();
            showPanel.add(selectMonth);
            btmid.setText(str);

        } else if (e.getSource() == btyear[5]) {
            String str = e.getActionCommand();
            int year = Integer.parseInt(str);
            curcalendar.set(Calendar.YEAR, year);
            showPanel.removeAll();
            showPanel.add(selectMonth);
            btmid.setText(str);

        } else if (e.getSource() == btyear[6]) {
            String str = e.getActionCommand();
            int year = Integer.parseInt(str);
            curcalendar.set(Calendar.YEAR, year);
            showPanel.removeAll();
            showPanel.add(selectMonth);
            btmid.setText(str);

        } else if (e.getSource() == btyear[7]) {
            String str = e.getActionCommand();
            int year = Integer.parseInt(str);
            curcalendar.set(Calendar.YEAR, year);
            showPanel.removeAll();
            showPanel.add(selectMonth);
            btmid.setText(str);

        } else if (e.getSource() == btyear[8]) {
            String str = e.getActionCommand();
            int year = Integer.parseInt(str);
            curcalendar.set(Calendar.YEAR, year);
            showPanel.removeAll();
            showPanel.add(selectMonth);
            btmid.setText(str);

        } else if (e.getSource() == btyear[9]) {
            String str = e.getActionCommand();
            int year = Integer.parseInt(str);
            curcalendar.set(Calendar.YEAR, year);
            showPanel.removeAll();
            showPanel.add(selectMonth);
            btmid.setText(str);

        } else if (e.getSource() == btyear[10]) {
            String str = e.getActionCommand();
            int year = Integer.parseInt(str);
            curcalendar.set(Calendar.YEAR, year);
            showPanel.removeAll();
            showPanel.add(selectMonth);
            btmid.setText(str);

        } else if (e.getSource() == btyear[11]) {
            String str = e.getActionCommand();
            int year = Integer.parseInt(str);
            curcalendar.set(Calendar.YEAR, year);
            showPanel.removeAll();
            showPanel.add(selectMonth);
            btmid.setText(str);

        } else {
            switch (e.getActionCommand()) {
                case "1月":
                    curcalendar.set(Calendar.MONTH, 0);
                    break;
                case "2月":
                    curcalendar.set(Calendar.MONTH, 1);
                    break;
                case "3月":
                    curcalendar.set(Calendar.MONTH, 2);
                    break;
                case "4月":
                    curcalendar.set(Calendar.MONTH, 3);
                    break;
                case "5月":
                    curcalendar.set(Calendar.MONTH, 4);
                    break;
                case "6月":
                    curcalendar.set(Calendar.MONTH, 5);
                    break;
                case "7月":
                    curcalendar.set(Calendar.MONTH, 6);
                    break;
                case "8月":
                    curcalendar.set(Calendar.MONTH, 7);
                    break;
                case "9月":
                    curcalendar.set(Calendar.MONTH, 8);
                    break;
                case "10月":
                    curcalendar.set(Calendar.MONTH, 9);
                    break;
                case "11月":
                    curcalendar.set(Calendar.MONTH, 10);
                    break;
                case "12月":
                    curcalendar.set(Calendar.MONTH, 11);
                    break;
                default:
                    String str = e.getActionCommand();
                    //String[] strs = str.split("月");
                    int year = Integer.parseInt(str);
                    curcalendar.set(Calendar.YEAR, year);
                    btmid.setText(curcalendar.get(Calendar.YEAR) + "");
                    showPanel.removeAll();
                    showPanel.add(selectMonth);
                    return;
            }
            showPanel.removeAll();
            updatebtday();
            showPanel.add(weekdayPanel,BorderLayout.NORTH);
            showPanel.add(calshowPanel,BorderLayout.CENTER);
            jFrame.setVisible(true);

        }
    }
}

```

---

> 本文最初发布于 CSDN：[查看原文](https://blog.csdn.net/qq_42618152/article/details/88627671)。
