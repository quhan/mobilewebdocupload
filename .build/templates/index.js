(function(dust){dust.register("index",body_0);var blocks={"body":body_1};function body_0(chk,ctx){ctx=ctx.shiftBlocks(blocks);return chk.p("layouts/master",ctx,{});}body_0.__dustBody=!0;function body_1(chk,ctx){ctx=ctx.shiftBlocks(blocks);return chk.w("<div id=\"intro\" class=\"page\">").p("layouts/header",ctx,{}).w("<div><p>Yes! I would like to apply as a/an</p><button class=\"js-application-type\" data-applicationtype=\"developer\">Code Ninja</button><button class=\"js-application-type\" data-applicationtype=\"intern\">Intern</button><p><small>Click to proceed</small></p></div></div><div id=\"upload\" class=\"page hide\">").p("layouts/header",ctx,{}).w("<div><h2>Upload your resume</h2><form id=\"uploadform\" name=\"uploadform\" enctype=\"multipart/form-data\"><input type=\"hidden\" id=\"_csrf\" name=\"_csrf\" value=\"").f(ctx.get(["_csrf"], false),ctx,"h").w("\" /><input type=\"hidden\" id=\"applicationtype\" name=\"applicationtype\" /><input type=\"file\" id=\"file\" name=\"file\" class=\"hide\" accept=\"image/jpeg,image/pjpeg,image/png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document\" /></form><button class=\"\" id=\"camerahero\">Camera</button><fieldset class=\"hide\" id=\"uploadcontrols\"><div class=\"\" id=\"thumbnails\"></div><div class=\"\"><button class=\"\" id=\"camera\">Camera</button></div><div class=\"\"><button class=\"\" id=\"submit\">Submit</button></div></fieldset><div id=\"progress\" class=\"progress-bar hide\"><span style=\"width: 80%;\">80%</span></div></div></div><div id=\"summary\" class=\"page hide\">").p("layouts/header",ctx,{}).w("<div><p>Your resume has been successfully uploaded!</p><p>We will review your application and contact you if there's a match.</p><p>Thank you!</p></div></div>");}body_1.__dustBody=!0;return body_0;})(dust);